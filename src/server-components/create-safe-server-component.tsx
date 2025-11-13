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
} from './errors'

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
      const unsafe_params = await props.params
      if (unsafe_params === undefined) {
        throw new NoSegmentsProvidedError(id, 'page')
      }

      const parsedSegments = parseWithDictionary(
        options.segments,
        unsafe_params
      )
      if (parsedSegments.issues) {
        await onSegmentsValidationError(parsedSegments.issues)
      } else {
        segments = parsedSegments.value
      }
    }

    let searchParams = undefined
    if (options.searchParams) {
      const unsafe_searchParams = await props.searchParams
      if (unsafe_searchParams === undefined) {
        throw new NoSearchParamsProvidedError(id, 'page')
      }

      const parsedSearchParams = parseWithDictionary(
        options.searchParams,
        unsafe_searchParams
      )
      if (parsedSearchParams.issues) {
        await onSearchParamsValidationError(parsedSearchParams.issues)
      } else {
        searchParams = parsedSearchParams.value
      }
    }

    // Authorize the server component
    try {
      // Build page auth function params
      const authParams = {
        id,
        ...(segments ? { segments } : {}),
        ...(searchParams ? { searchParams } : {}),
      } as PageAuthFunctionParams<TSegments, TSearchParams>

      await authorize(authParams)
    } catch (err: unknown) {
      log.error(`Page server component '${id}' not authorized`)
      throw err
    }

    try {
      // Build safe page server component context
      const ctx = {
        id,
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
      log.error(
        `🛑 Page server component '${id}' failed to execute after ${executionClock.get()}`,
        err
      )
      return await onError(err)
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
>(
  options: CreateSafeLayoutServerComponentOptions<AC, TSegments>,
  layoutServerComponentFn: SafeLayoutServerComponent<AC, TSegments>
): CreateSafeLayoutServerComponentReturnType {
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
  return async function SafeLayoutServerComponent(props: LayoutProvidedProps) {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running layout server component'${id}'`)

    let segments = undefined
    if (options.segments) {
      const unsafe_params = await props.params
      if (unsafe_params === undefined) {
        throw new NoSegmentsProvidedError(id, 'page')
      }

      const parsedSegments = parseWithDictionary(
        options.segments,
        unsafe_params
      )
      if (parsedSegments.issues) {
        await onSegmentsValidationError(parsedSegments.issues)
      } else {
        segments = parsedSegments.value
      }
    }

    // Authorize the server component
    try {
      // Build layout auth function params
      const authParams = {
        id,
        ...(segments ? { segments } : {}),
      } as LayoutAuthFunctionParams<TSegments>

      await authorize(authParams)
    } catch (err: unknown) {
      log.error(`Layout server component '${id}' not authorized`)
      throw err
    }

    try {
      // Build safe layout server component context
      const ctx = {
        id,
        ...(segments ? { segments } : {}),
        children: props.children,
      } as SafeLayoutServerComponentContext<AC, TSegments>

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
      log.error(
        `🛑 Layout server component '${id}' failed to execute after ${executionClock.get()}`,
        err
      )
      return await onError(err)
    }
  }
}
