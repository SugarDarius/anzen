import type {
  StandardSchemaDictionary,
  StandardSchemaV1,
} from './standard-schema'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObjectType = {}
type UnwrapReadonlyObject<T> = T extends Readonly<infer U> ? U : T

// Public API types
export type Awaitable<T> = T | PromiseLike<T>
export type AuthContext = Record<string, unknown>

export type TSegmentsDict = StandardSchemaDictionary
export type TSearchParamsDict = StandardSchemaDictionary
export type TBodySchema = StandardSchemaV1
export type TFormDataDict = StandardSchemaDictionary

export type AuthFunction<AC extends AuthContext | undefined> = (input: {
  /**
   * Original request
   */
  readonly req: Request
  /**
   * Parsed request url
   */
  readonly url: URL
}) => Awaitable<AC | Response>

export type BaseOptions<AC extends AuthContext | undefined> = {
  /**
   * ID for the route handler.
   * Used when logging in development or when `debug` is enabled.
   *
   * You can also use it in the route handler definition to add extra logging
   * or monitoring.
   */
  id?: string

  /**
   * Function to use to authorize the request.
   * By default it always authorize the request.
   *
   * When returning a response, it will be used as the response for the request.
   * Return a response when the request is not authorized.
   */
  authorize?: AuthFunction<AC>

  /**
   * Callback triggered when the request fails.
   * By default it returns a simple `500` response and the error is logged into the console.
   *
   * Use it if your handler use custom errors and
   * you want to manage them properly by returning a proper response.
   */
  onErrorResponse?: (err: unknown) => Awaitable<Response>

  /**
   * Use this options to enable debug mode.
   * It will add logs in the handler to help you debug the request.
   *
   * By default it's `false` for in production builds.
   * In development builds, it will be `true` if `NODE_ENV` is not set to `production`.
   */
  debug?: boolean
}

export type OnValidationErrorResponse = (
  issues: readonly StandardSchemaV1.Issue[]
) => Awaitable<Response>

export type CreateSafeRouteHandlerOptions<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
  TBody extends TBodySchema | undefined,
  TFormData extends TFormDataDict | undefined,
> = {
  /**
   * Dynamic route segments used in the route handler path.
   */
  segments?: TSegments
  /**
   * Callback triggered when dynamic segments validations returned issues.
   * By default it returns a simple `400` response and issues are logged into the console.
   */
  onSegmentsValidationErrorResponse?: OnValidationErrorResponse

  /**
   * Search params used in the route.
   */
  searchParams?: TSearchParams
  /**
   * Callback triggered when search params validations returned issues.
   * By default it returns a simple `400` response and issues are logged into the console.
   */
  onSearchParamsValidationErrorResponse?: OnValidationErrorResponse

  /**
   * Request body.
   *
   * Returns a `405` response if the request method is not `POST`, 'PUT' or 'PATCH'.
   * Returns a `415`response if the request does not explicitly set the `Content-Type` to `application/json`.
   */
  body?: TBody

  /**
   * Callback triggered when body validation returned issues.
   * By default it returns a simple `400` response and issues are logged into the console.
   */
  onBodyValidationErrorResponse?: OnValidationErrorResponse

  /**
   * Request form data.
   *
   * Returns a `405` response if the request method is not `POST`, 'PUT' or 'PATCH'.
   * Returns a `415`response if the request does not explicitly set the `Content-Type` to `multipart/form-data`
   * or to `application/x-www-form-urlencoded`.
   */
  formData?: TFormData

  /**
   * Callback triggered when form data validation returned issues.
   * By default it returns a simple `400` response and issues are logged into the console.
   */
  onFormDataValidationErrorResponse?: OnValidationErrorResponse
} & BaseOptions<AC>

export type RequestExtras = {
  /**
   * Route dynamic segments as params
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any> // Sticking to Next.js requirements for building
}

export type CreateSafeRouteHandlerReturnType = (
  /**
   * Original request
   */
  req: Request,
  /**
   * Extras added by Next.js itself
   */
  extras: RequestExtras
) => Promise<Response>

// TODO: find better way to type it 👇🏻
export type SafeRouteHandlerContext<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
  TBody extends TBodySchema | undefined,
  TFormData extends TFormDataDict | undefined,
> = {
  /**
   * Route handler ID
   */
  readonly id: string
  /**
   * Parsed request url
   */
  readonly url: URL
} & (AC extends AuthContext
  ? {
      readonly auth: AC
    }
  : EmptyObjectType) &
  (TSegments extends TSegmentsDict
    ? {
        readonly segments: UnwrapReadonlyObject<
          StandardSchemaDictionary.InferOutput<TSegments>
        >
      }
    : EmptyObjectType) &
  (TSearchParams extends TSearchParamsDict
    ? {
        readonly searchParams: UnwrapReadonlyObject<
          StandardSchemaDictionary.InferOutput<TSearchParams>
        >
      }
    : EmptyObjectType) &
  (TBody extends TBodySchema
    ? {
        readonly body: StandardSchemaV1.InferOutput<TBody>
      }
    : EmptyObjectType) &
  (TFormData extends TFormDataDict
    ? {
        readonly formData: UnwrapReadonlyObject<
          StandardSchemaDictionary.InferOutput<TFormData>
        >
      }
    : EmptyObjectType)

export type SafeRouteHandler<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
  TSearchParams extends TSearchParamsDict | undefined,
  TBody extends TBodySchema | undefined,
  TFormData extends TFormDataDict | undefined,
> = (
  /**
   * Safe route handler context
   */
  ctx: SafeRouteHandlerContext<AC, TSegments, TSearchParams, TBody, TFormData>,
  /**
   * Original request
   */
  req: Request
) => Promise<Response>
