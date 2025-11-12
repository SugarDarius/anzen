import type {
  StandardSchemaDictionary,
  StandardSchemaV1,
} from './standard-schema'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyObjectType = {}
export type UnwrapReadonlyObject<T> = T extends Readonly<infer U> ? U : T

// Public API types
export type Awaitable<T> = T | PromiseLike<T>
export type AuthContext = Record<string, unknown>

export type TSegmentsDict = StandardSchemaDictionary
export type TSearchParamsDict = StandardSchemaDictionary
export type TBodySchema = StandardSchemaV1
export type TFormDataDict = StandardSchemaDictionary

export type AuthFunction<AC extends AuthContext | undefined> = (input: {
  /**
   * Parsed request url
   */
  readonly url: URL
  /**
   * Original request
   *
   * Cloned from the incoming request to avoid side effects
   * and to make it consumable in the `authorize` function.
   * Due to `NextRequest` limitations as the req is cloned it's always a `Request`
   */
  req: Request
}) => Awaitable<AC | Response>

export type BaseOptions<AC extends AuthContext | undefined> = {
  /**
   * ID for the route handler.
   * Used when logging in development or when `debug` is enabled.
   *
   * You can also use it to add extra logging or monitoring.
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
   * By default it's set to `false` for production builds.
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
   * Dynamic route segments used for the route handler path.
   * By design it will handler if the segments are a `Promise` or not.
   *
   * Please note the expected input is a `StandardSchemaDictionary`.
   */
  segments?: TSegments
  /**
   * Callback triggered when dynamic segments validations returned issues.
   * By default it returns a simple `400` response and issues are logged into the console.
   */
  onSegmentsValidationErrorResponse?: OnValidationErrorResponse

  /**
   * Search params used in the route.
   *
   * Please note the expected input is a `StandardSchemaDictionary`.
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
   *
   * IMPORTANT: The body is parsed as JSON, so it must be a valid JSON object!
   * IMPORTANT: Body shouldn't be used with `formData` at the same time. They are exclusive.
   * Why making the distinction? `formData` is used as a `StandardSchemaDictionary` whereas `body` is used as a `StandardSchemaV1`.
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
   *
   * IMPORTANT: formData shouldn't be used with `body` at the same time. They are exclusive.
   * Why making the distinction? `formData` is used as a `StandardSchemaDictionary` whereas `body` is used as a `StandardSchemaV1`.
   */
  formData?: TFormData

  /**
   * Callback triggered when form data validation returned issues.
   * By default it returns a simple `400` response and issues are logged into the console.
   */
  onFormDataValidationErrorResponse?: OnValidationErrorResponse
} & BaseOptions<AC>

export type ProvidedRouteContext = {
  /**
   * Route dynamic segments as params
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Awaitable<any> | undefined // Sticking to Next.js requirements for building
}

export type CreateSafeRouteHandlerReturnType<TReq extends Request = Request> = (
  /**
   * Original request
   */
  req: TReq,
  /**
   * Provided context added by Next.js itself
   */
  providedContext: ProvidedRouteContext
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
      /**
       * Auth context
       */
      readonly auth: AC
    }
  : EmptyObjectType) &
  (TSegments extends TSegmentsDict
    ? {
        /**
         * Validated route dynamic segments
         */
        readonly segments: UnwrapReadonlyObject<
          StandardSchemaDictionary.InferOutput<TSegments>
        >
      }
    : EmptyObjectType) &
  (TSearchParams extends TSearchParamsDict
    ? {
        /**
         * Validated search params
         */
        readonly searchParams: UnwrapReadonlyObject<
          StandardSchemaDictionary.InferOutput<TSearchParams>
        >
      }
    : EmptyObjectType) &
  (TBody extends TBodySchema
    ? {
        /**
         * Validated request body
         */
        readonly body: StandardSchemaV1.InferOutput<TBody>
      }
    : EmptyObjectType) &
  (TFormData extends TFormDataDict
    ? {
        /**
         * Validated form data
         */
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
  TReq extends Request = Request,
> = (
  /**
   * Safe route handler context
   */
  ctx: SafeRouteHandlerContext<AC, TSegments, TSearchParams, TBody, TFormData>,
  /**
   * Original request
   */
  req: TReq
) => Promise<Response>
