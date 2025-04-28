import type { StandardSchemaV1 } from './standard-schema'

/** @internal */
export type TRouteDynamicSegmentsSchema = StandardSchemaV1

// Public API types
export type Awaitable<T> = T | Promise<T>

export type CreateSafeRouteHandlerOptions<
  TRouteDynamicSegments extends TRouteDynamicSegmentsSchema,
> = {
  /**
   * Name for the route handler.
   */
  name?: string
  /**
   * Dynamic route segments used in the route handler path.
   */
  routeDynamicSegments: TRouteDynamicSegments
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
  TRouteDynamicSegments extends TRouteDynamicSegmentsSchema,
> = {
  /**
   * Route handler dynamic segments
   */
  routeDynamicSegments: StandardSchemaV1.InferOutput<TRouteDynamicSegments>
}

export type SafeRouteHandler<
  TRouteDynamicSegments extends TRouteDynamicSegmentsSchema,
> = (
  /**
   * Safe route handler context
   */
  ctx: SafeRouteHandlerContext<TRouteDynamicSegments>,
  /**
   * Original request
   */
  req: Request
) => Promise<Response>
