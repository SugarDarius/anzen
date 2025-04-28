import { either, numeric, record, string } from 'decoders'

export const routeParamsDecoder = record(string, either(string, numeric))
