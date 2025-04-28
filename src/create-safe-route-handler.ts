import type {
  TRouteDynamicSegmentsSchema,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
  RequestExtras,
} from './types'

export function createSafeRouterHandler<
  TRouteDynamicSegments extends TRouteDynamicSegmentsSchema,
>(
  options: CreateSafeRouteHandlerOptions<TRouteDynamicSegments>,
  handlerFn: SafeRouteHandler<TRouteDynamicSegments>
): CreateSafeRouteHandlerReturnType {
  return async function (
    req: Request,
    _extras: RequestExtras
  ): Promise<Response> {
    // TODO: add core logic here
    return await handlerFn(
      {
        // TODO: update
        routeDynamicSegments: {},
      },
      req
    )
  }
}
