import type {
  StandardSchemaDictionary,
  StandardSchemaV1,
} from './standard-schema'

// Public API types
export type Awaitable<T> = T | Promise<T>

export type TSegmentsDict = StandardSchemaDictionary

export type BaseOptions = {
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
  authorize?: (
    /**
     * Original request
     */
    req: Request
  ) => Awaitable<true | Response>
}

export type CreateSafeRouteHandlerOptions<
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
} & BaseOptions

export type RequestExtras = {
  /**
   * Route dynamic segments as params
   */
  params: Awaitable<Record<string, string | string[] | undefined>>
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
  TSegments extends TSegmentsDict | undefined,
> = TSegments extends TSegmentsDict
  ? { readonly segments: StandardSchemaDictionary.InferOutput<TSegments> }
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {}

export type SafeRouteHandler<TSegments extends TSegmentsDict | undefined> = (
  /**
   * Safe route handler context
   */
  ctx: SafeRouteHandlerContext<TSegments>,
  /**
   * Original request
   */
  req: Request
) => Promise<Response>
