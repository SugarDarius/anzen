// Internal API types
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyObjectType = {}
export type UnwrapReadonlyObject<T> = T extends Readonly<infer U> ? U : T

// Public API types
export type Awaitable<T> = T | PromiseLike<T>
export type AuthContext = Record<string, unknown>
