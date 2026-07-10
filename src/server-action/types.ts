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
export interface ServerError {
  readonly code: 'SERVER_ERROR'
  readonly ctx: ServerActionErrorContext
}

/**
 * Unauthorized error.
 * Triggered when server action is not authorized by the `authorize` function
 * 👉🏻 When `authorize` function throws an error.
 *
 * Context `ctx` is used to store the error context.
 * It can be customized by using the `onError` option when creating the server action.
 */
export interface UnauthorizedError {
  readonly code: 'UNAUTHORIZED_ERROR'
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
export interface ValidationError {
  readonly code: 'VALIDATION_ERROR'
  readonly ctx: ServerActionErrorContext
}

/**
 * Tagged error.
 * It represents an error expected to be used in the server action
 * defined by developers themselves.
 */
export interface TaggedError {
  readonly code: string
  readonly ctx: ServerActionErrorContext
}

export type SafeServerActionError =
  | ValidationError
  | UnauthorizedError
  | ServerError
  | TaggedError

export interface SafeServerActionResultSuccess<TOutput> {
  readonly success: true
  readonly output: TOutput
  readonly error?: never
}

export interface SafeServerActionResultError<TError> {
  readonly success: false
  readonly output?: never
  readonly error: TError
}

// TODO: find better way to type it 👇🏻
export type ServerActionAuthFunctionParams<
  TInput extends TInputSchema | undefined,
> = {
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

export type ServerActionAuthFunction<
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
  params: ServerActionAuthFunctionParams<TInput>,
) => Awaitable<AC | never>

export type OnError = (err: unknown) => Awaitable<ServerActionErrorContext>
export type OnInputValidationError = (
  issues: readonly StandardSchemaV1.Issue[],
) => Awaitable<ServerActionErrorContext>

export interface CreateSafeServerActionOptions<
  TInput extends TInputSchema | undefined,
  AC extends AuthContext | undefined,
> {
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

  /**
   * Function to use to authorize the server action.
   * By default it always authorize the server action.
   *
   * Returns an unauthorized error when the server action is not authorized
   * or never when `redirect`, `notFound`, `forbidden` or `unauthorized` are thrown.
   */
  authorize?: ServerActionAuthFunction<AC, TInput>
}

export type SafeServerActionResult<TOutput, TError> =
  | SafeServerActionResultSuccess<TOutput>
  | SafeServerActionResultError<TError>
  | never

export type InferServerActionProvidedInput<
  TInput extends TInputSchema | undefined,
> = TInput extends TInputSchema
  ? FormData | StandardSchemaV1.InferOutput<TInput>
  : undefined

export type CreateSafeServerActionReturnType<
  TInput extends TInputSchema | undefined,
  TOutput,
  TError,
> = [TInput] extends [TInputSchema]
  ? (
      providedInput: InferServerActionProvidedInput<TInput>,
    ) => Promise<SafeServerActionResult<TOutput, TError>>
  : (
      providedInput?: InferServerActionProvidedInput<TInput>,
    ) => Promise<SafeServerActionResult<TOutput, TError>>

// TODO: find better way to type it 👇🏻
export type SafeServerActionContext<
  TInput extends TInputSchema | undefined,
  AC extends AuthContext | undefined,
> = {
  /**
   * Server action ID
   */
  readonly id: string
  /**
   * Tag error function
   * Throws a developer defined tagged error.
   * @example
   * ```ts
   * // Server
   * export const myAction = createSafeServerAction({
   *  id: 'my action,
   * }, async ({ tagErr }) => {
   *  tagErr('CONFLICT', {
   *    message: 'resource already exists',
   *  })
   * })
   *
   * // Client
   * const result = await myAction()
   * if (result.success === false) {
   *  if (result.error.code === 'CONFLICT') {
   *    return <span>{result.error.ctx.message}</span>
   *  }
   * }
   * ```
   */
  readonly tagErr: (code: string, ctx: ServerActionErrorContext) => never
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
  ctx: SafeServerActionContext<TInput, AC>,
) => Promise<TOutput | never>

/**
 * Infer type helper for safe server actions.
 * Used to infer the result type of a safe server action.
 *
 * @example
 * ```ts
 * export const greet = createSafeServerAction(
 *   { id: 'greet' },
 *   async ({ input }) => ({ message: `Hello, ${input.name}` })
 * )
 *
 * export type GreetResult = InferSafeServerActionResult<
 *   typeof greet
 * >
 * ```
 */
export type InferSafeServerActionResult<
  /**
   * Widest safe server action signature, used as a constraint for inference.
   * Accepts both no-input and with-input actions returned by `createSafeServerAction`.
   */
  TAction extends (
    ...args: never[]
  ) => Promise<SafeServerActionResult<unknown, SafeServerActionError>>,
> = Awaited<ReturnType<TAction>>
