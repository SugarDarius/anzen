import { validateWithSchema, type StandardSchemaV1 } from '../standard-schema'
import type { AuthContext, Awaitable } from '../types'
import {
  createExecutionClock,
  createLogger,
  isNativeError,
  isNextNativeError,
} from '../utils'
import type {
  AuthFunctionParams,
  CreateSafeServerActionOptions,
  CreateSafeServerActionReturnType,
  InferServerActionProvidedInput,
  SafeServerActionContext,
  SafeServerActionError,
  SafeServerActionHandler,
  SafeServerActionResult,
  ServerActionErrorContext,
  TInputSchema,
} from './types'

/** @internal exported for testing only */
export const DEFAULT_ACTION_ID = '[unknown:server:action]'

/**
 * Overload for server actions with no input.
 * Used when calling server actions with no input schema provided,
 * making the DX for developers easier and nicer. It avoids to call
 * a server action with `undefined` as input.
 */
export function createSafeServerAction<
  TOutput,
  AC extends AuthContext | undefined = undefined,
>(
  options: CreateSafeServerActionOptions<undefined, AC>,
  handler: SafeServerActionHandler<TOutput, undefined, AC>
): CreateSafeServerActionReturnType<undefined, TOutput, SafeServerActionError>

/**
 * Overload for server actions with input.
 */
export function createSafeServerAction<
  TOutput,
  TInput extends TInputSchema,
  AC extends AuthContext | undefined = undefined,
>(
  options: CreateSafeServerActionOptions<TInput, AC> & { input: TInput },
  handler: SafeServerActionHandler<TOutput, TInput, AC>
): CreateSafeServerActionReturnType<TInput, TOutput, SafeServerActionError>

/**
 * Creates a safe server action with input validation and error handling
 * for Next.js (>= 14) server actions.
 *
 * @param options - Options to configure the server action.
 * @param actionFn - The server action function.
 *
 * @returns A Next.js server action function.
 */
export function createSafeServerAction<
  TOutput,
  TInput extends TInputSchema | undefined = undefined,
  AC extends AuthContext | undefined = undefined,
>(
  options: CreateSafeServerActionOptions<TInput, AC>,
  handler: SafeServerActionHandler<TOutput, TInput, AC>
): CreateSafeServerActionReturnType<TInput, TOutput, SafeServerActionError> {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_ACTION_ID

  const authorize = options.authorize ?? (async () => undefined)

  const onError =
    options.onError ??
    ((err: unknown): Awaitable<ServerActionErrorContext> => {
      log.error(`🛑 Unexpected error in server action '${id}'`, err)

      if (isNativeError(err)) {
        return {
          message: err.message,
          name: err.name,
          stack: err.stack,
        }
      }

      return {
        message: JSON.stringify(err),
      }
    })

  const onInputValidationError =
    options.onInputValidationError ??
    ((
      issues: readonly StandardSchemaV1.Issue[]
    ): Awaitable<ServerActionErrorContext> => {
      log.error(`🛑 Invalid input for server action '${id}'`, issues)
      return {
        issues,
      }
    })

  return async function (
    providedInput?: InferServerActionProvidedInput<TInput>
  ): Promise<SafeServerActionResult<TOutput, SafeServerActionError>> {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running server action '${id}'`)

    let input = undefined
    if (options.input) {
      let input_unsafe: unknown = undefined
      if (providedInput instanceof FormData) {
        input_unsafe = Object.fromEntries(providedInput.entries())
      } else {
        input_unsafe = providedInput
      }

      const parsedInput = validateWithSchema(options.input, input_unsafe)
      if (parsedInput.issues) {
        const ctx = await onInputValidationError(parsedInput.issues)
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            ctx,
          },
        }
      }

      input = parsedInput.value
    }

    let auth = undefined
    try {
      const authParams = {
        id,
        ...(input ? { input } : {}),
      } as AuthFunctionParams<TInput>

      auth = await authorize(authParams)
    } catch (err: unknown) {
      executionClock.stop()

      if (isNextNativeError(err)) {
        log.info(
          `ℹ️ Ignoring native Next.js error while authorizing server action '${id}'`
        )
        throw err
      }

      log.error(
        `🔴 Server action '${id}' not authorized after ${executionClock.get()}`
      )

      const ctx = await onError(err)

      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          ctx,
        },
      }
    }

    const ctx = {
      id,
      ...(auth ? { auth } : {}),
      ...(input ? { input } : {}),
    } as SafeServerActionContext<TInput, AC>

    try {
      const output = await handler(ctx)

      executionClock.stop()
      log.info(
        `✅ Server action '${id}' executed successfully in ${executionClock.get()}`
      )

      return {
        success: true,
        output,
      }
    } catch (err: unknown) {
      executionClock.stop()

      if (isNextNativeError(err)) {
        log.info(`ℹ️ Ignoring native Next.js error in server action '${id}'`)
        throw err
      }

      log.error(
        `🔴 Server action '${id}' failed to execute after ${executionClock.get()}`
      )
      const ctx = await onError(err)
      return {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          ctx,
        },
      }
    }
  }
}
