/** Public API types  */
export type Awaitable<T> = T | Promise<T>

export type RouteParamsInput = Array<string | [string, 'numeric']>
export type RouteParamsOutput = Record<string, string | number>
