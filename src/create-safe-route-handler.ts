import { log } from './utils'
import { parseWithDictionary, type StandardSchemaV1 } from './standard-schema'
import type {
  TSegmentsDict,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
  RequestExtras,
  SafeRouteHandlerContext,
} from './types'

export function createSafeRouteHandler<
  TRouteDynamicSegments extends TSegmentsDict | undefined = undefined,
>(
  options: CreateSafeRouteHandlerOptions<TRouteDynamicSegments>,
  handlerFn: SafeRouteHandler<TRouteDynamicSegments>
): CreateSafeRouteHandlerReturnType {
  const onValidationError =
    options.onValidationError ??
    ((
      artifact: 'segments',
      issues: readonly StandardSchemaV1.Issue[]
    ): never => {
      console.error(`🛑 Invalid properties for ${artifact}:`, issues)
      throw new Error(`Invalid properties for ${artifact}`)
    })

  return async function (
    req: Request,
    extras: RequestExtras
  ): Promise<Response> {
    log(`🔄 Running route handler '${options.name}'`)

    let segments = undefined
    if (options.segments) {
      const params = await extras.params // TODO
      const parsedSegments = parseWithDictionary(options.segments, params)
      if (parsedSegments.issues) {
        return onValidationError('segments', parsedSegments.issues)
      }

      segments = parsedSegments.value
    }

    const ctx = {
      ...(segments !== undefined ? { segments } : {}),
    } as SafeRouteHandlerContext<TRouteDynamicSegments>

    return await handlerFn(ctx, req)
  }
}

// const GET = createSafeRouteHandler(
//   { name: '', segments: {} },
//   async (ctx, req) => {
//     ctx.segments
//     return new Response('GET')
//   }
// )
