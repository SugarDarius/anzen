import { createLogger } from './utils'
import { parseWithDictionary, type StandardSchemaV1 } from './standard-schema'
import type {
  TSegmentsDict,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
  RequestExtras,
  SafeRouteHandlerContext,
  AuthContext,
  Awaitable,
} from './types'

export function createSafeRouteHandler<
  AC extends AuthContext | undefined = undefined,
  TRouteDynamicSegments extends TSegmentsDict | undefined = undefined,
>(
  options: CreateSafeRouteHandlerOptions<AC, TRouteDynamicSegments>,
  handlerFn: SafeRouteHandler<AC, TRouteDynamicSegments>
): CreateSafeRouteHandlerReturnType {
  const log = createLogger(options.debug)

  const onErrorResponse =
    options.onErrorResponse ??
    ((err: unknown): Awaitable<Response> => {
      log.error(`🛑 Unexpected error in route handler '${options.name}'`, err)
      return new Response('Internal server error', {
        status: 500,
      })
    })

  const onSegmentsValidationErrorResponse =
    options.onSegmentsValidationErrorResponse ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<Response> => {
      log.error(
        `🛑 Invalid segments for route handler '${options.name}':`,
        issues
      )
      return new Response('Invalid segments', {
        status: 400,
      })
    })

  const authorize = options.authorize ?? (async () => undefined)

  return async function (
    req: Request,
    extras: RequestExtras
  ): Promise<Response> {
    log.info(`🔄 Running route handler '${options.name}'`)

    log.info(`👉🏻 Request url: ${req.url}`)
    const url = new URL(req.url)

    const authOrResponse = await authorize({ req, url })
    if (authOrResponse instanceof Response) {
      log.error(`🛑 Request not authorized for route handler '${options.name}'`)
      return authOrResponse
    }

    let segments = undefined
    if (options.segments) {
      const params = await extras.params
      const parsedSegments = parseWithDictionary(options.segments, params)

      if (parsedSegments.issues) {
        return await onSegmentsValidationErrorResponse(parsedSegments.issues)
      }

      segments = parsedSegments.value
    }

    const ctx = {
      url,
      ...(authOrResponse !== undefined ? { auth: authOrResponse } : {}),
      ...(segments !== undefined ? { segments } : {}),
    } as SafeRouteHandlerContext<AC, TRouteDynamicSegments>

    try {
      return await handlerFn(ctx, req)
    } catch (err) {
      return await onErrorResponse(err)
    }
  }
}

// export const GET = createSafeRouteHandler(
//   {
//     name: 'Simple',
//     authorize: async () => {
//       return { user: 'aurelien' }
//     },
//   },
//   async (ctx) => {
//     return Response.json({ message: `Hello ${ctx.auth.user}` })
//   }
// )
