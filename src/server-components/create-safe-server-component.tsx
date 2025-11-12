import { createExecutionClock, createLogger } from '../utils'
import { parseWithDictionary, type StandardSchemaV1 } from '../standard-schema'
import type { Awaitable, AuthContext } from '../types'
import type {
  TSegmentsDict,
  TSearchParamsDict,
  CreateSafeServerComponentOptions,
  CreateSafeServerComponentReturnType,
  SafeServerComponentRoot,
  ProvidedProps,
  AuthFunctionParams,
  SafeServerComponentContext,
} from './types'
import {
  ValidationError,
  NoSegmentsProvidedError,
  NoSearchParamsProvidedError,
} from './errors'

/** @internal exported for testing only */
export const DEFAULT_ID = '[unknown:server:component]'

/**
 * Creates a safe server component with data validation and error handling
 * for Next.js (>= 14) server components.
 *
 * @param options - Options to configure the server component.
 * @param componentFn -
 *
 * @returns A Next.js server component.
 */

export function createSafeServerComponent<
  AC extends AuthContext | undefined = undefined,
  TSegments extends TSegmentsDict | undefined = undefined,
  TSearchParams extends TSearchParamsDict | undefined = undefined,
>(
  options: CreateSafeServerComponentOptions<AC, TSegments, TSearchParams>,
  rootServerComponent: SafeServerComponentRoot<AC, TSegments, TSearchParams>
): CreateSafeServerComponentReturnType {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_ID

  const onError =
    options.onError ??
    ((err: unknown): Awaitable<never> => {
      log.error(`🛑 Unexpected error in server component '${id}'`, err)
      throw err
    })

  const onSegmentsValidationError =
    options.onSegmentsValidationError ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<never> => {
      log.error(`🛑 Invalid segments for server component '${id}'`, issues)
      throw new ValidationError('segments', id)
    })

  const onSearchParamsValidationError =
    options.onSearchParamsValidationError ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<never> => {
      log.error(`🛑 Invalid search params for server component '${id}'`, issues)
      throw new ValidationError('searchParams', id)
    })

  const authorize = options.authorize ?? (async () => undefined)

  // Next.js server component
  return async function ServerComponent(
    props: ProvidedProps
  ): Promise<React.ReactElement | never> {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running server component'${id}'`)

    let segments = undefined
    if (options.segments) {
      const params_unsafe = await props.params
      if (params_unsafe === undefined) {
        throw new NoSegmentsProvidedError(id)
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
        throw new NoSearchParamsProvidedError(id)
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
    try {
      // Build auth function params
      const authParams = {
        id,
        ...(segments ? { segments } : {}),
        ...(searchParams ? { searchParams } : {}),
      } as AuthFunctionParams<TSegments, TSearchParams>

      await authorize(authParams)
    } catch (err: unknown) {
      log.error(`Server component '${id}' not authorized`)
      throw err
    }

    try {
      // Build safe server component context
      const ctx = {
        id,
        ...(segments ? { segments } : {}),
        ...(searchParams ? { searchParams } : {}),
      } as SafeServerComponentContext<AC, TSegments, TSearchParams>
      const ServerComponent = await rootServerComponent(ctx)
      executionClock.stop()
      log.info(
        `✅ Server component '${id}' executed successfully in ${executionClock.get()}`
      )

      return ServerComponent
    } catch (err: unknown) {
      executionClock.stop()
      log.error(
        `🛑 Server component '${id}' failed to execute after ${executionClock.get()}`,
        err
      )
      return await onError(err)
    }
  }
}
