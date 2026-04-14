import type { StandardSchemaV1 } from '../standard-schema'
import type {
  AuthContext,
  Awaitable,
  EmptyObjectType,
  UnwrapReadonlyObject,
} from '../types'

export type TInputSchema = StandardSchemaV1

// export type OnError<
//   SEC extends ServerErrorContext | undefined = BaseServerErrorContext,
// > = (err: unknown) => Awaitable<SEC | never>

// export type OnValidationError<
//   VEC extends ValidationErrorContext | undefined = BaseValidationErrorContext,
// > = (issues: readonly StandardSchemaV1.Issue[]) => Awaitable<VEC | never>

// export type BaseOptions<
//   TInput extends TInputSchema | undefined,
//   SEC extends ServerErrorContext | undefined,
//   VEC extends ValidationErrorContext | undefined,
// > = {
//   /**
//    * ID for the server action.
//    * Used when logging in development or when `debug` is enabled.
//    *
//    * You can also use it to add extra logging or monitoring.
//    */
//   id?: string

//   /**
//    * Use this options to enable debug mode.
//    * It will add logs in the handler to help you debug server action.
//    *
//    * By default it's set to `false` for production builds.
//    * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
//    */
//   debug?: boolean

//   /**
//    * Callback triggered when the server action throws an unhandled error.
//    * By default it will return an error context object and the error is logged into the console.
//    *
//    * Use it if you want to manage unexpected errors properly
//    * to log, trace or define navigation behaviors like using `notFound` or `redirect`.
//    */
//   onError?: OnError<SEC>

//   /**
//    * Server action input used to call the action.
//    */
//   input?: TInput
//   /**
//    * Callback triggered when input validation returned issues.
//    * By default it returns a validation error context object and issues are logged into the console.
//    */
//   onInputValidationError?: OnValidationError<VEC>
// }

export type ServerActionErrorContext = Record<string, unknown>

export type ServerError = {
  readonly code: 'SERVER_ERROR'
  readonly ctx: ServerActionErrorContext
}

export type UnauthorizedError = {
  readonly code: 'UNAUTHORIZED'
  readonly ctx: ServerActionErrorContext
}

export type ValidationError = {
  readonly code: 'VALIDATION_ERROR'
  readonly ctx: ServerActionErrorContext & {
    readonly issues: StandardSchemaV1.Issue[]
  }
}

export type SafeServerActionError =
  | UnauthorizedError
  | ValidationError
  | ServerError

export type SafeServerActionResultSuccess<TOutput> = {
  /** @internal - for internal use only */
  readonly __success: true
  readonly output: TOutput
  readonly error?: never
}

export type SafeServerActionResultError<TError> = {
  /** @internal - for internal use only */
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
   * Server action input schema used to validate the input
   * when calling the server action.
   *
   * Please note the expected input is a `StandardSchemaV1`.
   */
  input?: TInput
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
