import type { StandardSchemaV1 } from '../standard-schema'
import type {
  AuthContext,
  Awaitable,
  EmptyObjectType,
  UnwrapReadonlyObject,
} from '../types'

export type TInputSchema = StandardSchemaV1<object>

// export enum ServerActionErrorCode {
//   SERVER_ERROR = 'SERVER_ERROR',
//   VALIDATION_ERROR = 'VALIDATION_ERROR',
//   NO_INPUT_PROVIDED_ERROR = 'NO_INPUT_PROVIDED_ERROR',
//   UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
// }

// export type ServerErrorContext = Record<string, unknown>
// export type BaseServerErrorContext = {
//   message: string
//   name?: string
//   stack?: string
// }

// export type ServerError<
//   SEC extends ServerErrorContext = BaseServerErrorContext,
// > = {
//   code: ServerActionErrorCode.SERVER_ERROR
//   ctx: SEC
// }

// export type ValidationErrorContext = Record<string, unknown>
// export type BaseValidationErrorContext = {
//   issues: readonly StandardSchemaV1.Issue[]
// }
// export type ValidationError<
//   VEC extends ValidationErrorContext | undefined = BaseValidationErrorContext,
// > = {
//   code: ServerActionErrorCode.VALIDATION_ERROR
//   ctx: VEC
// }

// export type NoInputProvidedError = {
//   code: ServerActionErrorCode.NO_INPUT_PROVIDED_ERROR
//   ctx: undefined
// }

// export type UnauthorizedError = {
//   code: ServerActionErrorCode.UNAUTHORIZED_ERROR
//   ctx: undefined
// }

// export type SafeServerActionResult<
//   TOutput,
//   SEC extends ServerErrorContext | undefined,
//   VEC extends ValidationErrorContext | undefined,
// > =
//   | {
//       output: TOutput
//       error: undefined
//     }
//   | {
//       output: undefined
//       error:
//         | ServerError<SEC>
//         | ValidationError<VEC>
//         | NoInputProvidedError
//         | UnauthorizedError
//     }

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

// export type ActionFunctionParams<TInput extends TInputSchema | undefined> = {
//   /**
//    * Server action ID
//    */
//   readonly id: string
// } & (TInput extends TInputSchema
//   ? {
//       /**
//        * Validated input
//        */
//       readonly input: UnwrapReadonlyObject<StandardSchemaV1.InferOutput<TInput>>
//     }
//   : EmptyObjectType)

// export type ActionAuthFunction<
//   AC extends AuthContext | undefined,
//   TInput extends TInputSchema | undefined,
// > = (params: ActionFunctionParams<TInput>) => Awaitable<AC | never>

export type AuthFunctionParams<TInput extends TInputSchema | undefined> = {
  readonly id: string
} & (TInput extends TInputSchema
  ? {
      readonly input: UnwrapReadonlyObject<StandardSchemaV1.InferOutput<TInput>>
    }
  : EmptyObjectType)

export type AuthFunction<
  AC extends AuthContext | undefined,
  TInput extends TInputSchema | undefined,
> = (params: AuthFunctionParams<TInput>) => Awaitable<AC | never>

export type BaseOptions<TInput extends TInputSchema | undefined> = {
  id?: string

  debug?: boolean

  input?: TInput
}

// export type CreateSafeServerActionOptions<
//   AC extends AuthContext | undefined,
//   TInput extends TInputSchema | undefined,
//   SEC extends ServerErrorContext | undefined,
//   VEC extends ValidationErrorContext | undefined,
// > = BaseOptions<TInput, SEC, VEC> & {
//   /**
//    * Function to use to authorize the server action.
//    * By default it always authorize the server action.
//    *
//    * Returns an unauthorized error when the server action is not authorized
//    * or never when `redirect`, `notFound`, `forbidden` or `unauthorized` are thrown.
//    */
//   authorize?: ActionAuthFunction<AC, TInput>
// }

export type SafeServerActionResultSuccess<TOutput> = {
  /** @internal - for internal use only */
  __success: true
  output: TOutput
  error?: never
}

export type SafeServerActionResultError<TError> = {
  /** @internal - for internal use only */
  __success: false
  output?: never
  error: TError
}

export type SafeServerActionResult<TOutput, TError> =
  | SafeServerActionResultSuccess<TOutput>
  | SafeServerActionResultError<TError>
  | never

export type CreateSafeServerActionOptions<
  AC extends AuthContext | undefined,
  TInput extends TInputSchema | undefined,
> = BaseOptions<TInput> & {
  authorize?: AuthFunction<AC, TInput>
}

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

// export type CreateSafeServerActionReturnType<
//   TInput extends TInputSchema | undefined,
//   SEC extends ServerErrorContext | undefined,
//   VEC extends ValidationErrorContext | undefined,
//   TOutput = undefined,
// > = (
//   input: InferServerActionInput<TInput>
// ) => Promise<SafeServerActionResult<TOutput, SEC, VEC>>

export type SafeServerActionContext<TInput extends TInputSchema | undefined> = {
  readonly id: string
} & (TInput extends TInputSchema
  ? {
      readonly input: UnwrapReadonlyObject<StandardSchemaV1.InferOutput<TInput>>
    }
  : EmptyObjectType)

export type SafeServerActionHandler<
  TOutput,
  TInput extends TInputSchema | undefined,
> = (ctx: SafeServerActionContext<TInput>) => Promise<TOutput>
