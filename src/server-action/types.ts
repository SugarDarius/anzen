import type { StandardSchemaV1 } from '../standard-schema'
import type {
  AuthContext,
  Awaitable,
  EmptyObjectType,
  UnwrapReadonlyObject,
} from '../types'

export type TInputSchema = StandardSchemaV1

export type ErrorContext = Record<string, unknown>
export type DefaultErrorContext = {
  error: {
    code: 'INTERNAL_ERROR'
  } & (
    | {
        type: 'parsed'
        message: string
        stack: string
        name: string
      }
    | {
        type: 'stringified'
        value: string
      }
  )
}
export type ValidationErrorContext = Record<string, unknown>
export type DefaultValidationErrorContext = {
  error: {
    code: 'VALIDATION_ERROR'
    issues: readonly StandardSchemaV1.Issue[]
  }
}

export type OnError<EC extends ErrorContext | undefined> = (
  err: unknown
) => Awaitable<EC extends ErrorContext ? EC : DefaultErrorContext | never>

export type OnValidationError<VEC extends ValidationErrorContext | undefined> =
  (
    issues: readonly StandardSchemaV1.Issue[]
  ) => Awaitable<
    VEC extends ValidationErrorContext
      ? VEC
      : DefaultValidationErrorContext | never
  >

export type BaseOptions<
  TInput extends TInputSchema | undefined,
  EC extends ErrorContext | undefined,
  VEC extends ValidationErrorContext | undefined,
> = {
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
   * to log, trace or define navigation behaviors like using `notFound` or `redirect`.
   */
  onError?: OnError<EC>

  /**
   * Server action input used to call the action.
   */
  input?: TInput
  /**
   * Callback triggered when input validation returned issues.
   * By default it returns a validation error context object and issues are logged into the console.
   */
  onInputValidationError?: OnValidationError<VEC>
}

export type ActionFunctionParams<TInput extends TInputSchema | undefined> = {
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

export type ActionAuthFunction<
  AC extends AuthContext | undefined,
  TInput extends TInputSchema | undefined,
> = (params: ActionFunctionParams<TInput>) => Awaitable<AC | never>

export type CreateSafeServerActionOptions<
  AC extends AuthContext | undefined,
  TInput extends TInputSchema | undefined,
  EC extends ErrorContext | undefined,
  VEC extends ValidationErrorContext | undefined,
> = BaseOptions<TInput, EC, VEC> & {
  /**
   * Function to use to authorize the server action.
   * By default it always authorize the server action.
   *
   * Re
   */
  authorize?: ActionAuthFunction<AC, TInput>
}

export type InferServerActionInput<TInput extends TInputSchema | undefined> =
  TInput extends TInputSchema
    ? StandardSchemaV1.InferOutput<TInput> | FormData
    : never

export type InferServerActionOutput<
  EC extends ErrorContext | undefined,
  VEC extends ValidationErrorContext | undefined,
  TOutput,
> =
  | TOutput
  | ([EC] extends [ErrorContext] ? EC : DefaultErrorContext)
  | ([VEC] extends [ValidationErrorContext]
      ? VEC
      : DefaultValidationErrorContext)

export type CreateSafeServerActionReturnType<
  TInput extends TInputSchema | undefined,
  EC extends ErrorContext | undefined,
  VEC extends ValidationErrorContext | undefined,
  TOutput,
> = (
  input: InferServerActionInput<TInput>
) => Promise<InferServerActionOutput<EC, VEC, TOutput>>
