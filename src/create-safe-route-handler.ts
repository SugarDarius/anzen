import { createLogger } from './utils'
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

const DEFAULT_ID = '[unknown:route:handler]'

export function createSafeRouteHandler<
  AC extends AuthContext | undefined = undefined,
  TRouteDynamicSegments extends TSegmentsDict | undefined = undefined,
  TSearchParams extends TSearchParamsDict | undefined = undefined,
  TBody extends TBodySchema | undefined = undefined,
  TFormData extends TFormDataDict | undefined = undefined,
>(
  options: CreateSafeRouteHandlerOptions<
    AC,
    TRouteDynamicSegments,
    TSearchParams,
    TBody,
    TFormData
  >,
  handlerFn: SafeRouteHandler<
    AC,
    TRouteDynamicSegments,
    TSearchParams,
    TBody,
    TFormData
  >
): CreateSafeRouteHandlerReturnType {
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

  return async function (
    req: Request,
    extras: RequestExtras
  ): Promise<Response> {
    console.log('extras', extras)
    log.info(`🔄 Running route handler '${id}'`)

    log.info(`👉🏻 Request url: ${req.url}`)
    const url = new URL(req.url)

    const authOrResponse = await authorize({ req, url })
    if (authOrResponse instanceof Response) {
      log.error(`🛑 Request not authorized for route handler '${id}'`)
      return authOrResponse
    }

    let segments = undefined
    if (options.segments) {
      if (extras.params === undefined) {
        return new Response('No segments provided', { status: 400 })
      }

      const params = await extras.params
      const parsedSegments = parseWithDictionary(options.segments, params)

      if (parsedSegments.issues) {
        return await onSegmentsValidationErrorResponse(parsedSegments.issues)
      }

      segments = parsedSegments.value
    }

    let searchParams = undefined
    if (options.searchParams) {
      const parsedSearchParams = parseWithDictionary(
        options.searchParams,
        Object.fromEntries(url.searchParams.entries())
      )

      if (parsedSearchParams.issues) {
        return await onSearchParamsValidationErrorResponse(
          parsedSearchParams.issues
        )
      }

      searchParams = parsedSearchParams.value
    }

    let body = undefined
    if (options.body) {
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return new Response('Invalid method for request body', {
          status: 405,
        })
      }

      const contentType = req.headers.get('content-type')
      if (contentType !== 'application/json') {
        return new Response('Invalid content type for request body', {
          status: 415,
        })
      }

      const parsedBody = validateWithSchema(
        options.body,
        await req.json(),
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

      const parsedFormData = parseWithDictionary(
        options.formData,
        Object.fromEntries((await req.formData()).entries())
      )

      if (parsedFormData.issues) {
        return await onFormDataValidationErrorResponse(parsedFormData.issues)
      }

      formData = parsedFormData.value
    }

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

    try {
      return await handlerFn(ctx, req)
    } catch (err) {
      return await onErrorResponse(err)
    }
  }
}
