import { createLogger, createExecutionClock } from './utils'
import {
  parseWithDictionary,
  validateWithSchema,
  type StandardSchemaV1,
} from './standard-schema'
import type {
  Awaitable,
  AuthContext,
  TSegmentsDict,
  TSearchParamsDict,
  TBodySchema,
  TFormDataDict,
  RequestExtras,
  CreateSafeRouteHandlerOptions,
  CreateSafeRouteHandlerReturnType,
  SafeRouteHandler,
  SafeRouteHandlerContext,
} from './types'

/** @internal exported for testing only */
export const DEFAULT_ID = '[unknown:route:handler]'

/**
 * @internal
 *
 * Reads the request body as JSON.
 * If it fails, it calls the `onErrorResponse` callback.
 */
const readRequestBodyAsJson = async <TReq extends Request>(
  req: TReq
): Promise<unknown> => {
  const contentType = req.headers.get('content-type')
  if (contentType?.startsWith('application/json')) {
    return await req.json()
  }

  const text = await req.text()
  return JSON.parse(text)
}

/**
 * Creates a safe route handler with data validation and error handling
 * for Next.js (>= 14) API route handlers.
 *
 * @param options - Options to configure the route handler.
 * @param handlerFn - The route handler function.
 *
 * @returns A Next.js API route handler function.
 *
 * @example
 * ```ts
 * import { string } from 'decoders'
 *import { createSafeRouteHandler } from '@sugardarius/anzen'
 * import { auth } from '~/lib/auth'
 *
 * export const GET = createSafeRouteHandler(
 *  {
 *    id: 'my-safe-route-handler',
 *    authorize: async ({ req }) => {
 *      const session = await auth.getSession(req)
 *      if (!session) {
 *        return new Response(null, { status: 401 })
 *      }
 *
 *      return { user: session.user }
 *     },
 *     segments: {
 *       id: string,
 *     },
 *   },
 *   async ({ auth, segments, }, req): Promise<Response> => {
 *     return Response.json({ user: auth.user, segments }, { status: 200 })
 *   }
 *)
 * ```
 */
export function createSafeRouteHandler<
  AC extends AuthContext | undefined = undefined,
  TRouteDynamicSegments extends TSegmentsDict | undefined = undefined,
  TSearchParams extends TSearchParamsDict | undefined = undefined,
  TBody extends TBodySchema | undefined = undefined,
  TFormData extends TFormDataDict | undefined = undefined,
  TReq extends Request = Request,
>(
  options: CreateSafeRouteHandlerOptions<
    AC,
    TRouteDynamicSegments,
    TSearchParams,
    TBody,
    TFormData,
    TReq
  >,
  handlerFn: SafeRouteHandler<
    AC,
    TRouteDynamicSegments,
    TSearchParams,
    TBody,
    TFormData,
    TReq
  >
): CreateSafeRouteHandlerReturnType<TReq> {
  // NOTE: `body` and `formData` options are mutually exclusive 🎭
  if (options.body && options.formData) {
    throw new Error(
      'You cannot use both `body` and `formData` in the same route handler. They are both mutually exclusive.'
    )
  }

  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_ID

  const onErrorResponse =
    options.onErrorResponse ??
    ((err: unknown): Awaitable<Response> => {
      log.error(`🛑 Unexpected error in route handler '${id}'`, err)
      return new Response('Internal server error', {
        status: 500,
      })
    })

  const onSegmentsValidationErrorResponse =
    options.onSegmentsValidationErrorResponse ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<Response> => {
      log.error(`🛑 Invalid segments for route handler '${id}':`, issues)
      return new Response('Invalid segments', {
        status: 400,
      })
    })

  const onSearchParamsValidationErrorResponse =
    options.onSearchParamsValidationErrorResponse ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<Response> => {
      log.error(`🛑 Invalid search params for route handler '${id}':`, issues)
      return new Response('Invalid search params', {
        status: 400,
      })
    })

  const onBodyValidationErrorResponse =
    options.onBodyValidationErrorResponse ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<Response> => {
      log.error(`🛑 Invalid body for route handler '${id}':`, issues)
      return new Response('Invalid body', {
        status: 400,
      })
    })

  const onFormDataValidationErrorResponse =
    options.onFormDataValidationErrorResponse ??
    ((issues: readonly StandardSchemaV1.Issue[]): Awaitable<Response> => {
      log.error(`🛑 Invalid form data for route handler '${id}':`, issues)
      return new Response('Invalid form data', {
        status: 400,
      })
    })

  const authorize = options.authorize ?? (async () => undefined)

  // Next.js API Route handler declaration
  return async function (req: TReq, extras: RequestExtras): Promise<Response> {
    const executionClock = createExecutionClock()
    executionClock.start()

    log.info(`🔄 Running route handler '${id}'`)
    log.info(`👉🏻 Request ${req.method} ${req.url}`)

    const url = new URL(req.url)

    // Do not mutate / consume the original request
    const clonedReq_forAuth = req.clone() as TReq
    const authOrResponse = await authorize({ url }, clonedReq_forAuth)
    if (authOrResponse instanceof Response) {
      log.error(`🛑 Request not authorized for route handler '${id}'`)
      return authOrResponse
    }

    let segments = undefined
    if (options.segments) {
      const params = await extras.params
      if (params === undefined) {
        return new Response('No segments provided', { status: 400 })
      }

      const parsedSegments = parseWithDictionary(options.segments, params)
      if (parsedSegments.issues) {
        return await onSegmentsValidationErrorResponse(parsedSegments.issues)
      }

      segments = parsedSegments.value
    }

    let searchParams = undefined
    if (options.searchParams) {
      const queryParams_unsafe = [...url.searchParams.keys()].map((k) => {
        const values = url.searchParams.getAll(k)
        return [k, values.length > 1 ? values : values[0]]
      })

      const parsedSearchParams = parseWithDictionary(
        options.searchParams,
        Object.fromEntries(queryParams_unsafe)
      )

      if (parsedSearchParams.issues) {
        return await onSearchParamsValidationErrorResponse(
          parsedSearchParams.issues
        )
      }

      searchParams = parsedSearchParams.value
    }

    // Do not mutate / consume the original request
    const clonedReq_forBody = req.clone() as TReq

    let body = undefined
    if (options.body) {
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return new Response('Invalid method for request body', {
          status: 405,
        })
      }

      let body_unsafe: unknown
      try {
        body_unsafe = await readRequestBodyAsJson(clonedReq_forBody)
      } catch (err) {
        return await onErrorResponse(err)
      }

      const parsedBody = validateWithSchema(
        options.body,
        body_unsafe,
        'Request body validation must be synchronous'
      )

      if (parsedBody.issues) {
        return await onBodyValidationErrorResponse(parsedBody.issues)
      }

      body = parsedBody.value
    }

    let formData = undefined
    if (options.formData) {
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return new Response('Invalid method for request form data', {
          status: 405,
        })
      }

      const contentType = req.headers.get('content-type')
      if (
        !contentType?.startsWith('multipart/form-data') &&
        !contentType?.startsWith('application/x-www-form-urlencoded')
      ) {
        return new Response('Invalid content type for request form data', {
          status: 415,
        })
      }

      let formData_unsafe: FormData
      try {
        // NOTE: 🤔 maybe find a better way to counter the deprecation warning?
        formData_unsafe = await clonedReq_forBody.formData()
      } catch (err) {
        return await onErrorResponse(err)
      }

      const parsedFormData = parseWithDictionary(
        options.formData,
        Object.fromEntries(formData_unsafe.entries())
      )

      if (parsedFormData.issues) {
        return await onFormDataValidationErrorResponse(parsedFormData.issues)
      }

      formData = parsedFormData.value
    }

    // Build safe route handler context
    const ctx = {
      id,
      url,
      ...(authOrResponse ? { auth: authOrResponse } : {}),
      ...(segments ? { segments } : {}),
      ...(searchParams ? { searchParams } : {}),
      ...(body ? { body } : {}),
      ...(formData ? { formData } : {}),
    } as SafeRouteHandlerContext<
      AC,
      TRouteDynamicSegments,
      TSearchParams,
      TBody,
      TFormData
    >

    // Let's catch any error that might happen in the handler
    try {
      const response = await handlerFn(ctx, req)

      executionClock.stop()
      log.info(
        `✅ Route handler '${id}' executed successfully in ${executionClock.get()}`
      )

      return response
    } catch (err) {
      executionClock.stop()
      log.error(
        `🛑 Route handler '${id} failed to execute after ${executionClock.get()}'`
      )

      return await onErrorResponse(err)
    }
  }
}
