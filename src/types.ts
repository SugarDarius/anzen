// Public API types
export type Awaitable<T> = T | Promise<T>

export type CreateOptions = {
  /**
   * Name for the route handler.
   */
  name?: string
  /**
   * Dynamic route params used in the route handler path.
   */
  routeParams?: any
}

export type Context<TRouteParams> = {
  name: string
  routeParams: TRouteParams
}
