import { type DecoderType } from 'decoders'
import { routeParamsDecoder } from './decoders'

/** Public API types  */
export type Awaitable<T> = T | Promise<T>

export type RouteParamsInput = string[]
export type RouteParamsOutput = DecoderType<typeof routeParamsDecoder>

export type CreateOptions = {
  /**
   * Name for the route handler.
   */
  name?: string
  /**
   * Dynamic route params used in the route handler path.
   */
  routeParams?: RouteParamsInput
}

export type Context = {
  name: string
}
