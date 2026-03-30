'use server'

import type { AuthContext, Awaitable } from '../types'
import type { StandardSchemaV1 } from '../standard-schema'
import { createLogger } from '../utils'
import type {
  CreateSafeServerActionOptions,
  DefaultErrorContext,
  DefaultValidationErrorContext,
  ErrorContext,
  TInputSchema,
  ValidationErrorContext,
  CreateSafeServerActionReturnType,
  InferServerActionOutput,
} from './types'

/** @internal exported for testing only */
export const DEFAULT_ACTION_ID = '[unknown:server:action]'

/** @internal type guard to check if the error is an instance of Error */
const isError = (err: unknown): err is Error => {
  return err instanceof Error
}

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
  AC extends AuthContext | undefined = undefined,
  TInput extends TInputSchema | undefined = undefined,
  EC extends ErrorContext | undefined = undefined,
  VEC extends ValidationErrorContext | undefined = undefined,
  TOutput = undefined,
>(
  options: CreateSafeServerActionOptions<AC, TInput, EC, VEC>
): CreateSafeServerActionReturnType<TInput, EC, VEC, TOutput> {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_ACTION_ID

  const onError =
    options.onError ??
    ((err: unknown): Awaitable<DefaultErrorContext> => {
      log.error(`🛑 Unexpected error in server action '${id}'`, err)
      if (isError(err)) {
        return {
          error: {
            code: 'INTERNAL_ERROR',
            type: 'parsed',
            message: err.message,
            stack: err.stack ?? '[no stack trace]',
            name: err.name,
          },
        }
      }

      return {
        error: {
          code: 'INTERNAL_ERROR',
          type: 'stringified',
          value: String(err),
        },
      }
    })

  const onInputValidationError =
    options.onInputValidationError ??
    ((
      issues: readonly StandardSchemaV1.Issue[]
    ): Awaitable<DefaultValidationErrorContext> => {
      log.error(`🛑 Invalid input for server action '${id}'`, issues)
      return {
        error: { code: 'VALIDATION_ERROR', issues },
      }
    })

  const authorize = options.authorize ?? (async () => undefined)

  return async function (
    input
  ): Promise<InferServerActionOutput<EC, VEC, TOutput>> {
    return undefined
  }
}
