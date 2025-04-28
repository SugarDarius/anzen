import { parseWithDictionary } from './standard-schema'
import type {
  TSegmentsDict,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
  RequestExtras,
  SafeRouteHandlerContext,
} from './types'

export function createSafeRouterHandler<
  TRouteDynamicSegments extends TSegmentsDict | undefined = undefined,
>(
  options: CreateSafeRouteHandlerOptions<TRouteDynamicSegments>,
  handlerFn: SafeRouteHandler<TRouteDynamicSegments>
): CreateSafeRouteHandlerReturnType {
  return async function (
    req: Request,
    extras: RequestExtras
  ): Promise<Response> {
    let segments = undefined
    if (options.segments) {
      const params = await extras.params // TODO
      const parsedSegments = parseWithDictionary(options.segments, params)
      if (parsedSegments.issues) {
        return new Response('Invalid route segments', {
          // TODO: update
          status: 400,
          statusText: 'Bad Request',
        })
      }

      segments = parsedSegments.value
    }

    const ctx = {
      ...(segments !== undefined ? { segments } : {}),
    } as SafeRouteHandlerContext<TRouteDynamicSegments>

    return await handlerFn(ctx, req)
  }
}

// const GET = createSafeRouterHandler(
//   { name: '', segments: {} },
//   async (ctx, req) => {
//     ctx.segments
//     return new Response('GET')
//   }
// )
