import { createExecutionClock, createLogger } from '../utils'
import { parseWithDictionary, type StandardSchemaV1 } from '../standard-schema'
import type { Awaitable, AuthContext } from '../types'
import type {
  TSegmentsDict,
  TSearchParamsDict,
  PageAuthFunctionParams,
  PageProvidedProps,
  SafePageServerComponentContext,
  CreateSafePageServerComponentOptions,
  CreateSafePageServerComponentReturnType,
  SafePageServerComponent,
  CreateSafeLayoutServerComponentOptions,
  SafeLayoutServerComponent,
  CreateSafeLayoutServerComponentReturnType,
  LayoutProvidedProps,
  LayoutAuthFunctionParams,
  SafeLayoutServerComponentContext,
} from './types'
import {
  ValidationError,
  NoSegmentsProvidedError,
  NoSearchParamsProvidedError,
  MissingLayoutSlotsError,
} from './errors'

/**
 * @internal
 * Checks if an error is a Next.js redirect error.
 */
const isNextRedirectError = (error: unknown): boolean => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('digest' in error) ||
    typeof error.digest !== 'string'
  ) {
    return false
  }
  return error.digest.startsWith('NEXT_REDIRECT;')
}

/**
 * @internal
 * Checks if an error is a Next.js HTTP error (notFound, forbidden, unauthorized).
 */
const isNextHttpError = (error: unknown): boolean => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('digest' in error) ||
    typeof error.digest !== 'string'
  ) {
    return false
  }
  const digest = error.digest
  // Check for notFound (;404), forbidden (;403), or unauthorized (;401)
  return (
    digest.endsWith(';404') ||
    digest.endsWith(';403') ||
    digest.endsWith(';401')
  )
}

/**
 * @internal
 * Checks if an error is a Next.js native error that should not be logged.
 */
const isNextNativeError = (error: unknown): boolean => {
  return isNextRedirectError(error) || isNextHttpError(error)
}

/** @internal exported for testing only */
export const DEFAULT_PAGE_ID = '[unknown:page:server:component]'

/**
 * Creates a safe page server component with data validation and error handling
 * for Next.js (>= 14) page server components.
 *
 * @param options - Options to configure the pageserver component.
 * @param pageServerComponentFn - The page server component function.
 *
 * @returns A Next.js page server component.
 */
export function createSafePageServerComponent<
  AC extends AuthContext | undefined = undefined,
  TSegments extends TSegmentsDict | undefined = undefined,
  TSearchParams extends TSearchParamsDict | undefined = undefined,
>(
  options: CreateSafePageServerComponentOptions<AC, TSegments, TSearchParams>,
  pageServerComponentFn: SafePageServerComponent<AC, TSegments, TSearchParams>
): CreateSafePageServerComponentReturnType {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_PAGE_ID

  const onError =
    options.onError ??
    ((err: unknown): Awaitable<never> => {
      log.error(`🛑 Unexpected error in page server component '${id}'`, err)
      throw err
    })

  const onSegmentsValidationError =
    options.onSegmentsValidationError ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<never> => {
      log.error(`🛑 Invalid segments for page server component '${id}'`, issues)
      throw new ValidationError('segments', id, 'page')
    })

  const onSearchParamsValidationError =
    options.onSearchParamsValidationError ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<never> => {
      log.error(`🛑 Invalid search params for server component '${id}'`, issues)
      throw new ValidationError('searchParams', id, 'page')
    })

  const authorize = options.authorize ?? (async () => undefined)

  // Next.js page server component
  return async function SafePageServerComponent(
    props: PageProvidedProps
  ): Promise<React.ReactElement | never> {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running page server component'${id}'`)

    let segments = undefined
    if (options.segments) {
      const params_unsafe = await props.params
      if (params_unsafe === undefined) {
        throw new NoSegmentsProvidedError(id, 'page')
      }

      const parsedSegments = parseWithDictionary(
        options.segments,
        params_unsafe
      )
      if (parsedSegments.issues) {
        await onSegmentsValidationError(parsedSegments.issues)
      } else {
        segments = parsedSegments.value
      }
    }

    let searchParams = undefined
    if (options.searchParams) {
      const searchParams_unsafe = await props.searchParams
      if (searchParams_unsafe === undefined) {
        throw new NoSearchParamsProvidedError(id, 'page')
      }

      const parsedSearchParams = parseWithDictionary(
        options.searchParams,
        searchParams_unsafe
      )
      if (parsedSearchParams.issues) {
        await onSearchParamsValidationError(parsedSearchParams.issues)
      } else {
        searchParams = parsedSearchParams.value
      }
    }

    // Authorize the server component
    let auth = undefined
    try {
      // Build page auth function params
      const authParams = {
        id,
        ...(segments ? { segments } : {}),
        ...(searchParams ? { searchParams } : {}),
      } as PageAuthFunctionParams<TSegments, TSearchParams>

      auth = await authorize(authParams)
    } catch (err: unknown) {
      log.error(`🛑 Page server component '${id}' not authorized`)
      throw err
    }

    try {
      // Build safe page server component context
      const ctx = {
        id,
        ...(auth ? { auth } : {}),
        ...(segments ? { segments } : {}),
        ...(searchParams ? { searchParams } : {}),
      } as SafePageServerComponentContext<AC, TSegments, TSearchParams>

      // Execute the page server component
      const PageServerComponent = await pageServerComponentFn(ctx)

      // Stop the execution clock
      executionClock.stop()
      log.info(
        `✅ Page server component '${id}' executed successfully in ${executionClock.get()}`
      )

      return PageServerComponent
    } catch (err: unknown) {
      executionClock.stop()

      if (!isNextNativeError(err)) {
        log.error(
          `🛑 Page server component '${id}' failed to execute after ${executionClock.get()}`
        )
        return await onError(err)
      } else {
        log.info('ℹ️ Ignoring native Next.js error')
        throw err
      }
    }
  }
}

/** @internal exported for testing only */
export const DEFAULT_LAYOUT_ID = '[unknown:layout:server:component]'

/**
 * Creates a safe layout server component with data validation and error handling
 * for Next.js (>= 14) layout server components.
 *
 * @param options - Options to configure the pageserver component.
 * @param layoutServerComponentFn - The layout server component function.
 *
 * @returns A Next.js layout server component.
 */
export function createSafeLayoutServerComponent<
  AC extends AuthContext | undefined = undefined,
  TSegments extends TSegmentsDict | undefined = undefined,
  TSlots extends readonly string[] | undefined = undefined,
>(
  options: CreateSafeLayoutServerComponentOptions<AC, TSegments, TSlots>,
  layoutServerComponentFn: SafeLayoutServerComponent<AC, TSegments, TSlots>
): CreateSafeLayoutServerComponentReturnType<TSlots> {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_LAYOUT_ID

  const onError =
    options.onError ??
    ((err: unknown): Awaitable<never> => {
      log.error(`🛑 Unexpected error in layout server component '${id}'`, err)
      throw err
    })

  const onSegmentsValidationError =
    options.onSegmentsValidationError ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<never> => {
      log.error(
        `🛑 Invalid segments for layout server component '${id}'`,
        issues
      )
      throw new ValidationError('segments', id, 'page')
    })

  const authorize = options.authorize ?? (async () => undefined)

  // Next.js layout server component
  return async function SafeLayoutServerComponent({
    params,
    children,
    ...layoutSlots
  }: LayoutProvidedProps<TSlots>) {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running layout server component'${id}'`)

    let segments = undefined
    if (options.segments) {
      const params_unsafe = await params
      if (params_unsafe === undefined) {
        throw new NoSegmentsProvidedError(id, 'page')
      }

      const parsedSegments = parseWithDictionary(
        options.segments,
        params_unsafe
      )
      if (parsedSegments.issues) {
        await onSegmentsValidationError(parsedSegments.issues)
      } else {
        segments = parsedSegments.value
      }
    }

    let experimental_slots = undefined
    if (options.experimental_slots) {
      // Validate that all expected slots exist in `layoutSlots`
      // We don't want to let pass unexpected slots to the layout server component
      // when using parallel routes and when they are not explicitly defined in the `experimental_slots` option.
      // It ensures data integrity and prevents potential security issues.
      const expectedSlots = options.experimental_slots
      const missingSlots: string[] = []

      for (const slotName of expectedSlots) {
        if (!(slotName in layoutSlots)) {
          missingSlots.push(slotName)
        }
      }

      if (missingSlots.length > 0) {
        throw new MissingLayoutSlotsError(id, missingSlots)
      }

      experimental_slots = layoutSlots
    }

    // Authorize the server component
    let auth = undefined
    try {
      // Build layout auth function params
      const authParams = {
        id,
        ...(segments ? { segments } : {}),
      } as LayoutAuthFunctionParams<TSegments>

      auth = await authorize(authParams)
    } catch (err: unknown) {
      log.error(`🛑 Layout server component '${id}' not authorized`)
      throw err
    }

    try {
      // Build safe layout server component context
      const ctx = {
        id,
        ...(auth ? { auth } : {}),
        ...(segments ? { segments } : {}),
        children,
        ...(experimental_slots ? { experimental_slots } : {}),
      } as SafeLayoutServerComponentContext<AC, TSegments, TSlots>

      // Execute the layout server component
      const LayoutServerComponent = await layoutServerComponentFn(ctx)

      // Stop the execution clock
      executionClock.stop()
      log.info(
        `✅ Layout server component '${id}' executed successfully in ${executionClock.get()}`
      )

      return LayoutServerComponent
    } catch (err: unknown) {
      executionClock.stop()

      if (!isNextNativeError(err)) {
        log.error(
          `🛑 Layout server component '${id}' failed to execute after ${executionClock.get()}`
        )
        return await onError(err)
      } else {
        log.info('ℹ️ Ignoring native Next.js error')
        throw err
      }
    }
  }
}
