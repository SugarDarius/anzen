'use server'

import { validateWithSchema } from '../standard-schema'
import type { AuthContext } from '../types'
import { createExecutionClock, createLogger } from '../utils'
import type {
  CreateSafeServerActionOptions,
  CreateSafeServerActionReturnType,
  InferServerActionProvidedInput,
  InferServerActionValidatedInput,
  SafeServerActionResult,
  TInputSchema,
} from './types'

// const x = <T>(value: T): T => value
// const _y = x(10)

/** @internal exported for testing only */
export const DEFAULT_ACTION_ID = '[unknown:server:action]'

/** @internal type guard to check if the error is an instance of Error */
const isNativeError = (err: unknown): err is Error => {
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
  TOutput,
  AC extends AuthContext | undefined = undefined,
  TInput extends TInputSchema | undefined = undefined,
>(
  options: CreateSafeServerActionOptions<AC, TInput>
): CreateSafeServerActionReturnType<TInput, TOutput, unknown> {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_ACTION_ID

  return async function (
    providedInput: InferServerActionProvidedInput<TInput>
  ): Promise<SafeServerActionResult<TOutput, unknown>> {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running server action '${id}'`)

    let input: InferServerActionValidatedInput<TInput> | undefined = undefined
    if (options.input) {
      if (providedInput === undefined) {
        // TODO: Handle no input provided error
        return {
          __success: false,
          error: undefined,
        }
      }

      let input_unsafe: unknown = undefined
      if (providedInput instanceof FormData) {
        input_unsafe = Object.fromEntries(providedInput.entries())
      } else {
        input_unsafe = providedInput
      }

      const parsedInput = validateWithSchema(options.input, input_unsafe)
      if (parsedInput.issues) {
        // TODO: Handle input validation error
        return {
          __success: false,
          error: undefined,
        }
      }

      input = parsedInput.value as InferServerActionValidatedInput<TInput>
    }

    try {
      executionClock.stop()
      log.info(
        `✅ Server action '${id}' executed successfully in ${executionClock.get()}`
      )
      return {
        __success: true,
        output: undefined,
      }
    } catch (err: unknown) {
      executionClock.stop()
      return {
        __success: false,
        error: err, // TODO: Handle unexpected error
      }
    }
  }
}
// export function createSafeServerAction<
//   AC extends AuthContext | undefined = undefined,
//   TInput extends TInputSchema | undefined = undefined,
//   SEC extends ServerErrorContext = BaseServerErrorContext,
//   VEC extends ValidationErrorContext = BaseValidationErrorContext,
//   TOutput = undefined,
// >(
//   options: CreateSafeServerActionOptions<AC, TInput, SEC, VEC>
// ): CreateSafeServerActionReturnType<TInput, SEC, VEC, TOutput> {
//   const log = createLogger(options.debug)
//   const id = options.id ?? DEFAULT_ACTION_ID

//   const onError =
//     options.onError ??
//     ((err: unknown): Awaitable<SEC> => {
//       log.error(`🛑 Unexpected error in server action '${id}'`, err)

//       if (isNativeError(err)) {
//         return {
//           message: err.message,
//           name: err.name,
//           stack: err.stack,
//         }
//       }

//       return {
//         message: JSON.stringify(err),
//       }
//     })

//   const onInputValidationError =
//     options.onInputValidationError ??
//     ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<VEC> => {
//       log.error(`🛑 Invalid input for server action '${id}'`, issues)
//       return {
//         issues,
//       }
//     })

//   const authorize = options.authorize ?? (async () => undefined)

//   return async function (
//     input_unsafe: InferServerActionInput<TInput>
//   ): Promise<SafeServerActionResult<TOutput, SEC, VEC>> {
//     const executionClock = createExecutionClock()
//     executionClock.start()

//     log.info(`🔄 Running server action '${id}'`)

//     let input = undefined
//     if (options.input) {
//       if (input_unsafe === undefined) {
//         return {
//           output: undefined,
//           error: {
//             code: ServerActionErrorCode.NO_INPUT_PROVIDED_ERROR,
//             ctx: undefined,
//           },
//         }
//       }

//       const parsedInput = validateWithSchema(
//         options.input,
//         input_unsafe instanceof FormData
//           ? Object.fromEntries(input_unsafe.entries())
//           : input_unsafe
//       )
//       if (parsedInput.issues) {
//         const ctx = await onInputValidationError(parsedInput.issues)
//         return {
//           output: undefined,
//           error: {
//             code: ServerActionErrorCode.VALIDATION_ERROR,
//             ctx,
//           },
//         }
//       }
//       input = parsedInput
//     }

//     let auth = undefined
//     try {
//       const authParams = {
//         id,
//         ...(input ? { input } : {}),
//       } as ActionFunctionParams<TInput>

//       auth = await authorize(authParams)
//     } catch (err: unknown) {
//       if (!isNextNativeError(err)) {
//         log.error(`🛑 Server action '${id}' not authorized`, err)

//         if (isNativeError(err)) {
//           return {
//             output: undefined,
//             error: {
//               code: ServerActionErrorCode.SERVER_ERROR,
//               ctx: {
//                 message: err.message,
//                 name: err.name,
//                 stack: err.stack,
//               },
//             },
//           }
//         }
//         return {
//           output: undefined,
//           error: {
//             code: ServerActionErrorCode.SERVER_ERROR,
//             ctx: {
//               message: JSON.stringify(err),
//             },
//           },
//         }
//       } else {
//         log.info('ℹ️ Ignoring native Next.js error')
//         throw err
//       }
//     }

//     try {
//       executionClock.stop()
//       log.info(
//         `✅ Server action '${id}' executed successfully in ${executionClock.get()}`
//       )

//       return {
//         output: {},
//       }
//     } catch (err: unknown) {
//       executionClock.stop()

//       if (!isNextNativeError(err)) {
//         // Handle unexpected error
//       } else {
//         log.info('ℹ️ Ignoring native Next.js error')
//         throw err
//       }
//     }
//   }
// }
