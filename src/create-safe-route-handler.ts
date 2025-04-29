import { log } from './utils'
import { parseWithDictionary, type StandardSchemaV1 } from './standard-schema'
import type {
  TSegmentsDict,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
  RequestExtras,
  SafeRouteHandlerContext,
  AuthContext,
} from './types'

export function createSafeRouteHandler<
  AC extends AuthContext | undefined = undefined,
  TRouteDynamicSegments extends TSegmentsDict | undefined = undefined,
>(
  options: CreateSafeRouteHandlerOptions<AC, TRouteDynamicSegments>,
  handlerFn: SafeRouteHandler<AC, TRouteDynamicSegments>
): CreateSafeRouteHandlerReturnType {
  const onValidationError =
    options.onValidationError ??
    ((
      artifact: 'segments' | 'body',
      issues: readonly StandardSchemaV1.Issue[]
    ): never => {
      console.error(`🛑 Invalid properties for ${artifact}:`, issues)
      throw new Error(`Invalid properties for ${artifact}`)
    })

  const authorize = options.authorize ?? (async () => undefined)

  return async function (
    req: Request,
    extras: RequestExtras
  ): Promise<Response> {
    log(`🔄 Running route handler '${options.name}'`)

    const url = new URL(req.url)

    const authOrResponse = await authorize({ req, url })
    if (authOrResponse instanceof Response) {
      log(`🛑 Request not authorized for route '${options.name}'`)
      return authOrResponse
    }

    let segments = undefined
    if (options.segments) {
      const params = await extras.params
      const parsedSegments = parseWithDictionary(options.segments, params)

      if (parsedSegments.issues) {
        return onValidationError('segments', parsedSegments.issues)
      }

      segments = parsedSegments.value
    }

    const ctx = {
      ...(authOrResponse !== undefined ? { auth: authOrResponse } : {}),
      ...(segments !== undefined ? { segments } : {}),
    } as SafeRouteHandlerContext<AC, TRouteDynamicSegments>

    return await handlerFn(ctx, req)
  }
}

// export const GET = createSafeRouteHandler(
//   {
//     name: 'Simple',
//     authorize: async () => {
//       return { user: 'aurelien'}
//     },
//   },
//   async (ctx) => {
//     ctx.auth.user
//     return Response.json({ message: 'Hey 👋🏻' })
//   }
// )
