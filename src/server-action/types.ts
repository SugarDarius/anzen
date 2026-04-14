import type { StandardSchemaV1 } from '../standard-schema'
import type {
  AuthContext,
  Awaitable,
  EmptyObjectType,
  UnwrapReadonlyObject,
} from '../types'

export type TInputSchema = StandardSchemaV1

export type ServerActionErrorContext = Record<string, unknown>

/**
 * Generic server error.
 * Triggered when server action handler throws an unexpected error.
 *
 * Context `ctx` is used to store the error context.
 * It can be customized by using the `onError` option when creating the server action.
 */
export type ServerError = {
  readonly code: 'SERVER_ERROR'
  readonly ctx: ServerActionErrorContext
}

/**
 * Unauthorized error.
 * Triggered when server action is not authorized by the `authorize` function
 * 👉🏻 When `authorize` function throws an error.
 *
 *
 * Context `ctx` is used to store the error context.
 * It can be customized by using the `onError` option when creating the server action.
 */
export type UnauthorizedError = {
  readonly code: 'UNAUTHORIZED'
  readonly ctx: ServerActionErrorContext
}

/**
 * Validation error.
 * Triggered when server action input validation returns issues.
 *
 * Context `ctx` is used to store the error context.
 * It can be customized by using the `onInputValidationError` option when creating the server action.
 *
 * By default this error will return the issues `StandardSchemaV1.Issue[]` in the context when
 * no context customization is provided.
 */
export type ValidationError = {
  readonly code: 'VALIDATION_ERROR'
  readonly ctx: ServerActionErrorContext
}

/**
 * No input provided error.
 * Triggered when no input is provided when calling the server action.
 */
export type NoInputProvidedError = {
  readonly code: 'NO_INPUT_PROVIDED'
  readonly ctx: ServerActionErrorContext
}

export type SafeServerActionError =
  | ValidationError
  | NoInputProvidedError
  | UnauthorizedError
  | ServerError

export type SafeServerActionResultSuccess<TOutput> = {
  readonly __success: true
  readonly output: TOutput
  readonly error?: never
}

export type SafeServerActionResultError<TError> = {
  readonly __success: false
  readonly output?: never
  readonly error: TError
}

// TODO: find better way to type it 👇🏻
export type AuthFunctionParams<TInput extends TInputSchema | undefined> = {
  /**
   * Server action ID
   */
  readonly id: string
} & (TInput extends TInputSchema
  ? {
      /**
       * Validated input
       */
      readonly input: UnwrapReadonlyObject<StandardSchemaV1.InferOutput<TInput>>
    }
  : EmptyObjectType)

export type AuthFunction<
  AC extends AuthContext | undefined,
  TInput extends TInputSchema | undefined,
> = (
  /**
   * Auth function parameters
   * Contains the server action ID and the validated input.
   *
   * If the input is not provided, the property do not exists.
   *
   * @example
   * ```ts
   * authorize: async ({ id, input }) => {
   *  const auth = await getAuth()
   *  if (!auth) {
   *    throw new UnauthenticatedError()
   *  }
   *
   *  const hasAccess = await checkAccess({
   *    userId: auth.user.id,
   *    resourceId: input.resourceId,
   *  })
   *
   *  if (!hasAccess) {
   *    throw new ForbiddenError()
   *  }
   *
   *  return { user: auth.user }
   * }
   * ```
   */
  params: AuthFunctionParams<TInput>
) => Awaitable<AC | Response>

export type OnError = (err: unknown) => Awaitable<ServerActionErrorContext>
export type OnInputValidationError = (
  issues: readonly StandardSchemaV1.Issue[]
) => Awaitable<ServerActionErrorContext>

export type BaseOptions<TInput extends TInputSchema | undefined> = {
  /**
   * ID for the server action.
   * Used when logging in development or when `debug` is enabled.
   *
   * You can also use it to add extra logging or monitoring.
   */
  id?: string

  /**
   * Use this options to enable debug mode.
   * It will add logs in the handler to help you debug server action.
   *
   * By default it's set to `false` for production builds.
   * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
   */
  debug?: boolean

  /**
   * Callback triggered when the server action throws an unhandled error.
   * By default it will return an error context object and the error is logged into the console.
   *
   * Use it if you want to manage unexpected errors properly
   * to log or trace and define custom error contexts objects.
   *
   * ⚠️ By design, this callback isn't mean to be used to manage navigation behaviors like using `notFound` or `redirect`,
   * or with `throw` statements as it's best to handle them in the UI. ⚠️
   *
   * @example
   * ```ts
   * // ✅ Valid use case
   * onError: async (err: unknown) => {
   *  log.error(`🛑 Unexpected error in server action '${id}'`, err)
   *  if (err instanceof NotFoundError) {
   *    return {
   *      message: 'Resource not found',
   *    }
   *  }
   *
   *  return {
   *    message: 'An unexpected error occurred',
   *    err: JSON.stringify(err),
   *  }
   * }
   *
   * // ❌ Invalid use case
   * onError: async (err: unknown) => {
   *  throw err
   *  // or redirect('/')
   * }
   */
  onError?: OnError

  /**
   * Server action input schema used to validate the input
   * when calling the server action.
   *
   * Please note the expected input is a `StandardSchemaV1`.
   */
  input?: TInput

  /**
   * Callback triggered when input validation returned issues
   *  By default it will return an error context object and the error is logged into the console.
   *
   * Use it if you want to manage input validation errors properly
   * to log or trace and define custom error contexts objects.
   *
   * ⚠️ By design, this callback isn't mean to be used to manage navigation behaviors like using `notFound` or `redirect`,
   * or with `throw` statements as it's best to handle them in the UI. ⚠️
   *
   * @example
   * ```ts
   * // ✅ Valid use case
   * onInputValidationError: async (issues: readonly StandardSchemaV1.Issue[]) => {
   *  log.error(`🛑 Invalid input for server action '${id}'`, issues)
   *  return {
   *    message: 'Invalid input',
   *    issues,
   *  }
   * }
   *
   * // ❌ Invalid use case
   * onInputValidationError: async (issues: readonly StandardSchemaV1.Issue[]) => {
   *  throw new Error('Invalid input')
   * }
   * ```
   */
  onInputValidationError?: OnInputValidationError
}

export type CreateSafeServerActionOptions<
  TInput extends TInputSchema | undefined,
  AC extends AuthContext | undefined,
> = BaseOptions<TInput> & {
  /**
   * Function to use to authorize the server action.
   * By default it always authorize the server action.
   *
   * Returns an unauthorized error when the server action is not authorized
   * or never when `redirect`, `notFound`, `forbidden` or `unauthorized` are thrown.
   */
  authorize?: AuthFunction<AC, TInput>
}

export type SafeServerActionResult<TOutput, TError> =
  | SafeServerActionResultSuccess<TOutput>
  | SafeServerActionResultError<TError>
  | never

export type CreateSafeServerActionReturnType<
  TInput extends TInputSchema | undefined,
  TOutput,
  TError,
> = (
  providedInput: InferServerActionProvidedInput<TInput>
) => Promise<SafeServerActionResult<TOutput, TError>>

export type InferServerActionProvidedInput<
  TInput extends TInputSchema | undefined,
> = TInput extends TInputSchema
  ? FormData | StandardSchemaV1.InferOutput<TInput>
  : undefined

// TODO: find better way to type it 👇🏻
export type SafeServerActionContext<
  TInput extends TInputSchema | undefined,
  AC extends AuthContext | undefined,
> = {
  /**
   * Server action ID
   */
  readonly id: string
} & (AC extends AuthContext
  ? {
      /**
       * Auth context
       */
      readonly auth: AC
    }
  : EmptyObjectType) &
  (TInput extends TInputSchema
    ? {
        /**
         * Validated input
         */
        readonly input: UnwrapReadonlyObject<
          StandardSchemaV1.InferOutput<TInput>
        >
      }
    : EmptyObjectType)

export type SafeServerActionHandler<
  TOutput,
  TInput extends TInputSchema | undefined,
  AC extends AuthContext | undefined,
> = (
  /**
   * Safe server action context
   */
  ctx: SafeServerActionContext<TInput, AC>
) => Promise<TOutput | never>
