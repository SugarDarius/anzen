import type { StandardSchemaDictionary } from './standard-schema'

// Public API types
export type Awaitable<T> = T | Promise<T>

export type TSegmentsDict = StandardSchemaDictionary

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
}

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
  ? { segments: StandardSchemaDictionary.InferOutput<TSegments> }
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
