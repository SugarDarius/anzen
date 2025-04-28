import type {
  TRouteDynamicSegmentsDict,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
} from './types'

export function createSafeRouterHandler<
  TRouteDynamicSegments extends
    TRouteDynamicSegmentsDict = NonNullable<unknown>,
>(
  options: CreateSafeRouteHandlerOptions<TRouteDynamicSegments>,
  handlerFn: SafeRouteHandler<TRouteDynamicSegments>
): CreateSafeRouteHandlerReturnType {
  return async function (req, _extras): Promise<Response> {
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
