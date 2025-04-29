import type {
  StandardSchemaDictionary,
  StandardSchemaV1,
} from './standard-schema'

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObjectType = {}

// Public API types
export type Awaitable<T> = T | Promise<T>
export type AuthContext = Record<string, unknown>

export type TSegmentsDict = StandardSchemaDictionary

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
   * Callback triggered when validations returned issues.
   * By default it returns an error telling what properties are invalid.
   */
  onValidationError?: (
    artifact: 'segments' | 'body',
    issues: readonly StandardSchemaV1.Issue[]
  ) => never

  /**
   * Function to use to authorize the request.
   * By default it always authorize the request.
   *
   * When returning a response, it will be used as the response for the request.
   * Return a response when the request is not authorized.
   */
  authorize?: AuthFunction<AC>
}

export type CreateSafeRouteHandlerOptions<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
> = {
  /**
   * Name for the route handler.
   */
  name: string
  /**
   * Dynamic route segments used in the route handler path.
   */
  segments?: TSegments
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

export type SafeRouteHandlerContext<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
> = {
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
    ? { readonly segments: StandardSchemaDictionary.InferOutput<TSegments> }
    : EmptyObjectType)

export type SafeRouteHandler<
  AC extends AuthContext | undefined,
  TSegments extends TSegmentsDict | undefined,
> = (
  /**
   * Safe route handler context
   */
  ctx: SafeRouteHandlerContext<AC, TSegments>,
  /**
   * Original request
   */
  req: Request
) => Promise<Response>
