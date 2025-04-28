import { type DecoderType } from 'decoders'
import { routeParamsDecoder } from './decoders'

/** Public API types  */
export type Awaitable<T> = T | Promise<T>

export type RouteParamsInput = string[]
export type RouteParamsOutput = DecoderType<typeof routeParamsDecoder>
