import type { StandardSchemaDictionary } from './standard-schema'

/** @internal */
type TRouteDynamicSegmentsDict = StandardSchemaDictionary

// Public API types
export type Awaitable<T> = T | Promise<T>

export type CreateSafeRouteHandlerOptions<
  TRouteDynamicSegments extends TRouteDynamicSegmentsDict,
> = {
  /**
   * Name for the route handler.
   */
  name?: string
  /**
   * Dynamic route segments used in the route handler path.
   */
  routeDynamicSegments?: TRouteDynamicSegments
}

export type SafeRouteHandlerContext<
  TRouteDynamicSegments extends TRouteDynamicSegmentsDict,
> = {
  /**
   * Route handler dynamic segments
   */
  routeDynamicSegments: StandardSchemaDictionary.InferOutput<TRouteDynamicSegments>
}

export type CreateSafeRouteHandlerReturnType = (
  /**
   * Original request
   */
  req: Request,
  /**
   * Extras added by Next.js itself
   */
  extras: {
    params: Awaitable<Record<string, string | string[] | undefined>>
  }
) => Promise<Response>
