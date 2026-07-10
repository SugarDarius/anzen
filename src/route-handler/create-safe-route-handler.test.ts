import { string, numeric, object, array } from 'decoders'
import {
  describe,
  test,
  expect,
  expectTypeOf,
  afterEach,
  beforeEach,
  vi,
} from 'vitest'
import { z } from 'zod'

import { DEFAULT_ID, createSafeRouteHandler } from './create-safe-route-handler'

describe('default context', () => {
  test('provides default context', async () => {
    const GET = createSafeRouteHandler({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<{
        readonly id: string
        readonly url: URL
      }>()
      expect(ctx.id).toBe(DEFAULT_ID)
      expect(ctx.url).toBeInstanceOf(URL)
      expect(ctx.url.href).toBe('http://localhost:3000/')

      return Response.json({ message: 'Hello, world!' }, { status: 200 })
    })

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({ message: 'Hello, world!' })
  })
})

describe('Extends Request type gracefully - convenience purpose for extending NextRequest', () => {
  test('should extends Request type', async () => {
    class NRequest extends Request {
      cookies = () => 'cookies'
    }

    const GET = createSafeRouteHandler(
      {
        authorize: async ({ req }) => {
          expectTypeOf(req).toEqualTypeOf<Request>()
          return { user: 'John Doe' }
        },
        id: 'extends-request-type',
      },
      async (ctx, req: NRequest) => {
        expectTypeOf(req).toEqualTypeOf<NRequest>()
        expect(req.cookies()).toBe('cookies')

        expectTypeOf(ctx.auth).toEqualTypeOf<{
          user: string
        }>()
        expect(ctx.auth.user).toBe('John Doe')
        return Response.json({ message: 'Hello, world!' }, { status: 200 })
      },
    )
    const request = new NRequest('http://localhost:3000/')
    const response = await GET(request, { params: undefined })

    expect(response.status).toBe(200)
  })
})

describe('id customization', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  test('should use default id if not provided', async () => {
    const GET = createSafeRouteHandler({}, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe(DEFAULT_ID)
      return Response.json({ message: 'Hello, world!' }, { status: 200 })
    })

    const request = new Request('http://localhost:3000/')
    await GET(request, { params: undefined })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running route handler '${DEFAULT_ID}'`,
    )
  })

  test('should use custom id if provided', async () => {
    const handlerId = 'custom-id'
    const GET = createSafeRouteHandler({ id: handlerId }, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe('custom-id')
      return Response.json({ message: 'Hello, world!' }, { status: 200 })
    })

    const request = new Request('http://localhost:3000/')
    await GET(request, { params: undefined })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running route handler '${handlerId}'`,
    )
  })
})

describe('authorize', () => {
  test('should authorize the request and return auth context', async () => {
    const user = {
      id: 'ccd5cf55-de71-482b-bfee-ad450dbcd20e',
      name: 'Rocky Balboa',
    }

    const GET = createSafeRouteHandler(
      {
        authorize: () => ({ user }),
      },
      async ({ auth }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          user: {
            id: string
            name: string
          }
        }>()
        expect(auth.user.id).toBe(user.id)
        expect(auth.user.name).toBe(user.name)

        return Response.json({ user: auth.user }, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({ user })
  })

  test('should return a 401 response for unauthorized requests', async () => {
    const GET = createSafeRouteHandler(
      {
        authorize: () => new Response('Unauthorized', { status: 401 }),
      },
      async () => Response.json({ message: 'Hello, world!' }, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(401)
    expect(data).toBe('Unauthorized')
  })

  test('keeps the original request', async () => {
    const POST = createSafeRouteHandler(
      {
        authorize: async ({ req }) => {
          await expect(req.json()).resolves.toBeDefined()
          return { authorized: true }
        },
        body: object({
          name: string,
        }),
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: JSON.stringify({
        name: 'Anakin Skywalker',
      }),
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })

    expect(response.status).toBe(200)
  })

  test('receives validated segments in authorize', async () => {
    const GET = createSafeRouteHandler(
      {
        authorize: async ({ segments }) => {
          expectTypeOf(segments).toEqualTypeOf<{
            id: string
            page: number
          }>()
          expect(segments.id).toBe('suzuka')
          expect(segments.page).toBe(256)
          return { authorized: true }
        },
        segments: { id: string, page: numeric },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
    })

    expect(response.status).toBe(200)
  })

  test('receives validated searchParams in authorize', async () => {
    const GET = createSafeRouteHandler(
      {
        authorize: async ({ searchParams }) => {
          expectTypeOf(searchParams).toEqualTypeOf<{
            query: string
            page: number
          }>()
          expect(searchParams.query).toBe('luke')
          expect(searchParams.page).toBe(2)
          return { authorized: true }
        },
        searchParams: { page: numeric, query: string },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/?query=luke&page=2')
    const response = await GET(request, { params: undefined })

    expect(response.status).toBe(200)
  })

  test('receives validated body in authorize', async () => {
    const bodySchema = z.object({
      model: z.string(),
      name: z.string(),
    })

    const POST = createSafeRouteHandler(
      {
        authorize: async ({ body }) => {
          expectTypeOf(body).toEqualTypeOf<{
            name: string
            model: string
          }>()
          expect(body.name).toBe('Luke Skywalker')
          expect(body.model).toBe('X-Wing')
          return { authorized: true }
        },
        body: bodySchema,
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: JSON.stringify({
        model: 'X-Wing',
        name: 'Luke Skywalker',
      }),
      method: 'POST',
    })
    const response = await POST(request, { params: undefined })

    expect(response.status).toBe(200)
  })

  test('receives validated formData in authorize', async () => {
    const POST = createSafeRouteHandler(
      {
        authorize: async ({ formData }) => {
          expectTypeOf(formData).toEqualTypeOf<{
            id: string
            message: string
          }>()
          expect(formData.id).toBe('408f1c9d-25b7-4e0a-b491-1a0b14999fc8')
          expect(formData.message).toBe('This is a tweet!')
          return { authorized: true }
        },
        formData: {
          id: z.string(),
          message: z.string(),
        },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: new URLSearchParams({
        id: '408f1c9d-25b7-4e0a-b491-1a0b14999fc8',
        message: 'This is a tweet!',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })

    expect(response.status).toBe(200)
  })

  test('receives all validated attributes in authorize', async () => {
    const bodySchema = z.object({
      apiKey: z.string(),
      name: z.string(),
    })

    const POST = createSafeRouteHandler(
      {
        authorize: async ({ segments, searchParams, body }) => {
          expectTypeOf(segments).toEqualTypeOf<{
            accountId: string
            projectId: string
          }>()
          expectTypeOf(searchParams).toEqualTypeOf<{
            query: string
            page: number
          }>()
          expectTypeOf(body).toEqualTypeOf<{
            name: string
            apiKey: string
          }>()

          expect(segments.accountId).toBe(
            '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
          )
          expect(segments.projectId).toBe(
            '141399a5-14c5-47aa-bc04-2a281380b6e3',
          )
          expect(searchParams.query).toBe('liveblocks')
          expect(searchParams.page).toBe(2)
          expect(body.name).toBe('Super Butler')
          expect(body.apiKey).toBe('sk_ai_copilot_key')

          return { authorized: true }
        },
        body: bodySchema,
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/copilots?query=liveblocks&page=2',
      {
        body: JSON.stringify({
          apiKey: 'sk_ai_copilot_key',
          name: 'Super Butler',
        }),
        method: 'POST',
      },
    )
    const response = await POST(request, {
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })

    expect(response.status).toBe(200)
  })

  test('authorize receives id and url in params', async () => {
    const customId = 'custom-authorize-id'
    const GET = createSafeRouteHandler(
      {
        authorize: async ({ id, url }) => {
          expectTypeOf(id).toEqualTypeOf<string>()
          expectTypeOf(url).toEqualTypeOf<URL>()
          expect(id).toBe(customId)
          expect(url.href).toBe('http://localhost:3000/')
          return { authorized: true }
        },
        id: customId,
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })

    expect(response.status).toBe(200)
  })

  test('passes a cloned Request to authorize that is not the same reference as the handler request', async () => {
    let authorizeReq: Request | undefined
    let handlerReq: Request | undefined

    const GET = createSafeRouteHandler(
      {
        authorize: async ({ req }) => {
          authorizeReq = req
          return { authorized: true }
        },
      },
      async (_ctx, req) => {
        handlerReq = req
        return Response.json({}, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/')
    await GET(request, { params: undefined })

    expect(authorizeReq).toBeDefined()
    expect(handlerReq).toBeDefined()
    expect(authorizeReq).not.toBe(handlerReq)
    expect(authorizeReq?.url).toBe(handlerReq?.url)
  })

  test('returns onErrorResponse when authorize throws a normal error', async () => {
    const thrown = new Error('authorize failed')
    const GET = createSafeRouteHandler(
      {
        authorize: () => {
          throw thrown
        },
        id: 'auth-throw-route',
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(500)
    expect(data).toBe('Internal server error')
  })

  test('uses custom onErrorResponse when authorize throws', async () => {
    const GET = createSafeRouteHandler(
      {
        authorize: () => {
          throw new Error('boom')
        },
        onErrorResponse: () => new Response('authorize error', { status: 503 }),
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(503)
    expect(data).toBe('authorize error')
  })

  test('rethrows Next.js redirect errors from authorize', async () => {
    const redirectError = new Error('NEXT_REDIRECT') as Error & {
      digest: string
    }
    redirectError.digest = 'NEXT_REDIRECT;replace;/redirect-path;307;'

    const GET = createSafeRouteHandler(
      {
        authorize: () => {
          throw redirectError
        },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toBe(
      redirectError,
    )
  })

  test('rethrows Next.js notFound-style errors from authorize', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const GET = createSafeRouteHandler(
      {
        authorize: () => {
          throw notFoundError
        },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toBe(
      notFoundError,
    )
  })

  test('rethrows Next.js unauthorized-style errors from authorize', async () => {
    const unauthorizedError = new Error('NEXT_UNAUTHORIZED') as Error & {
      digest: string
    }
    unauthorizedError.digest = 'NEXT_HTTP_ERROR_FALLBACK;401'

    const GET = createSafeRouteHandler(
      {
        authorize: () => {
          throw unauthorizedError
        },
      },
      async () => Response.json({}, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toBe(
      unauthorizedError,
    )
  })
})

describe('on error response', () => {
  test('returns a 500 response for unexpected errors', async () => {
    const GET = createSafeRouteHandler(
      { id: 'internal-server-error' },
      async () => {
        throw new Error('Unexpected error')
      },
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(500)
    expect(data).toBe('Internal server error')
  })

  test('returns a custom response for unexpected errors', async () => {
    const GET = createSafeRouteHandler(
      {
        onErrorResponse: () =>
          new Response('Custom error response', { status: 500 }),
      },
      async () => {
        throw new Error('Unexpected error')
      },
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(500)
    expect(data).toBe('Custom error response')
  })
})

describe('Next.js native errors logging', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  test('does not log redirect errors', async () => {
    const redirectError = new Error('NEXT_REDIRECT') as Error & {
      digest: string
    }
    redirectError.digest = 'NEXT_REDIRECT;replace;/redirect-path;307;'

    const GET = createSafeRouteHandler(
      { debug: true, id: 'redirect-route' },
      async () => {
        throw redirectError
      },
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log notFound errors', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const GET = createSafeRouteHandler(
      { debug: true, id: 'notfound-route' },
      async () => {
        throw notFoundError
      },
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log forbidden errors', async () => {
    const forbiddenError = new Error('NEXT_FORBIDDEN') as Error & {
      digest: string
    }
    forbiddenError.digest = 'NEXT_HTTP_ERROR_FALLBACK;403'

    const GET = createSafeRouteHandler(
      { debug: true, id: 'forbidden-route' },
      async () => {
        throw forbiddenError
      },
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toThrow(
      'NEXT_FORBIDDEN',
    )

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log unauthorized errors', async () => {
    const unauthorizedError = new Error('NEXT_UNAUTHORIZED') as Error & {
      digest: string
    }
    unauthorizedError.digest = 'NEXT_HTTP_ERROR_FALLBACK;401'

    const GET = createSafeRouteHandler(
      { debug: true, id: 'unauthorized-route' },
      async () => {
        throw unauthorizedError
      },
    )

    const request = new Request('http://localhost:3000/')
    await expect(GET(request, { params: undefined })).rejects.toThrow(
      'NEXT_UNAUTHORIZED',
    )

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('still logs regular errors', async () => {
    const regularError = new Error('Regular error')

    const GET = createSafeRouteHandler(
      { debug: true, id: 'regular-error-route' },
      async () => {
        throw regularError
      },
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })

    expect(response.status).toBe(500)
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
    )
  })
})

describe('route dynamic segments validation', () => {
  test('validates segments correctly', async () => {
    const GET = createSafeRouteHandler(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        expectTypeOf(ctx.segments).toEqualTypeOf<{
          id: string
          page: number
        }>()

        return Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 },
        )
      },
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({ id: 'suzuka', page: 256 })
  })

  test('returns a 400 response for invalid segments', async () => {
    const GET = createSafeRouteHandler(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) =>
        Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 },
        ),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ page: 'unknown', ppid: 'suzuka' }),
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid segments')
  })

  test('returns a custom response for invalid segments', async () => {
    const GET = createSafeRouteHandler(
      {
        onSegmentsValidationErrorResponse: (issues) => {
          expect(issues).toHaveLength(2)
          return new Response('Custom error', { status: 400 })
        },
        segments: { id: string, page: numeric },
      },
      async (ctx) =>
        Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 },
        ),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ page: 'unknown', ppid: 'suzuka' }),
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Custom error')
  })

  test('returns a 400 response for missing segments', async () => {
    const GET = createSafeRouteHandler(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) =>
        Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 },
        ),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: undefined,
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('No segments provided')
  })
})

describe('URL search params validation', () => {
  test('validates search params correctly', async () => {
    const GET = createSafeRouteHandler(
      {
        searchParams: { page: numeric, query: string },
      },
      async ({ searchParams }) => {
        expectTypeOf(searchParams).toEqualTypeOf<{
          query: string
          page: number
        }>()

        return Response.json(searchParams, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/?query=luke&page=2')
    const response = await GET(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({ page: 2, query: 'luke' })
  })

  test('validates search params correctly with arrays', async () => {
    const GET = createSafeRouteHandler(
      {
        searchParams: {
          query: array(string),
        },
      },
      async ({ searchParams }) => {
        expectTypeOf(searchParams).toEqualTypeOf<{
          query: string[]
        }>()

        return Response.json(searchParams, { status: 200 })
      },
    )

    const request = new Request(
      'http://localhost:3000/?query=luke&query=anakin',
    )
    const response = await GET(request, { params: undefined })
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data).toStrictEqual({ query: ['luke', 'anakin'] })
  })

  test('returns a 400 response for invalid search params', async () => {
    const GET = createSafeRouteHandler(
      {
        searchParams: { page: numeric, query: string },
      },
      async ({ searchParams }) => Response.json(searchParams, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/?q=luke&page=unknown')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid search params')
  })

  test('returns a custom response for invalid search params', async () => {
    const GET = createSafeRouteHandler(
      {
        onSearchParamsValidationErrorResponse: (issues) => {
          expect(issues).toHaveLength(2)
          return new Response('Custom error', { status: 400 })
        },
        searchParams: { page: numeric, query: string },
      },
      async ({ searchParams }) => Response.json(searchParams, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/?q=luke&page=unknown')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Custom error')
  })
})

describe('exclusive `body` and `formData` validation', () => {
  test('throws an errors for using both body and formData', () => {
    expect(() => {
      createSafeRouteHandler(
        {
          body: z.object({ name: z.string() }),
          formData: { id: z.string() },
        },
        async () =>
          Response.json({ message: 'Hello, world!' }, { status: 200 }),
      )
    }).toThrowErrorMatchingInlineSnapshot(
      '[Error: You cannot use both `body` and `formData` in the same route handler. They are both mutually exclusive.]',
    )
  })
})

describe('request body validation', () => {
  const bodySchema = z.object({
    apiKey: z.string(),
    model: z.string(),
    name: z.string(),
  })

  test('validates body correctly', async () => {
    const POST = createSafeRouteHandler(
      {
        body: bodySchema,
      },
      async ({ body }) => {
        expectTypeOf(body).toEqualTypeOf<{
          name: string
          model: string
          apiKey: string
        }>()

        return Response.json(body, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/', {
      body: JSON.stringify({
        apiKey: '1234567890',
        model: 'X-Wing',
        name: 'Luke Skywalker',
      }),
      method: 'POST',
    })
    const response = await POST(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({
      apiKey: '1234567890',
      model: 'X-Wing',
      name: 'Luke Skywalker',
    })
  })

  test('returns a 400 response for invalid body', async () => {
    const POST = createSafeRouteHandler(
      {
        body: bodySchema,
      },
      async ({ body }) => Response.json(body, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: JSON.stringify({
        unknown: 'Betty Boop',
      }),
      method: 'POST',
    })
    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid body')
  })

  test('returns a custom response for invalid body', async () => {
    const POST = createSafeRouteHandler(
      {
        body: bodySchema,
        onBodyValidationErrorResponse: (issues) => {
          expect(issues).toHaveLength(3)
          return new Response('Custom error', { status: 400 })
        },
      },
      async ({ body }) => Response.json(body, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: JSON.stringify({
        unknown: 'Betty Boop',
      }),
      method: 'POST',
    })
    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Custom error')
  })

  test('returns a 500 for missing body', async () => {
    const POST = createSafeRouteHandler(
      {
        body: bodySchema,
      },
      async ({ body }) => Response.json(body, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      method: 'POST',
      // No body defined
    })
    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(500)
    expect(data).toBe('Internal server error')
  })

  test('returns a 405 for invalid method', async () => {
    const GET = createSafeRouteHandler(
      {
        body: bodySchema,
      },
      async ({ body }) => Response.json(body, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(405)
    expect(data).toBe('Invalid method for request body')
  })

  test('keeps the original request', async () => {
    const POST = createSafeRouteHandler(
      {
        body: bodySchema,
      },
      async ({ body }, req) => {
        await expect(req.json()).resolves.toBeDefined()
        return Response.json(body, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/', {
      body: JSON.stringify({
        apiKey: '1234567890',
        model: 'X-Wing',
        name: 'Luke Skywalker',
      }),
      method: 'POST',
    })
    const response = await POST(request, { params: undefined })

    expect(response.status).toBe(200)
  })
})

describe('request form data validation', () => {
  test('validates form data correctly', async () => {
    const POST = createSafeRouteHandler(
      {
        // Form data is dictionary not a body object
        formData: {
          id: z.string(),
          message: z.string(),
        },
      },
      async ({ formData }) => {
        expectTypeOf(formData).toEqualTypeOf<{
          id: string
          message: string
        }>()

        return Response.json(formData, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/', {
      body: new URLSearchParams({
        id: '408f1c9d-25b7-4e0a-b491-1a0b14999fc8',
        message: 'This is a tweet!',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({
      id: '408f1c9d-25b7-4e0a-b491-1a0b14999fc8',
      message: 'This is a tweet!',
    })
  })

  test('returns a 400 response for invalid form data', async () => {
    const POST = createSafeRouteHandler(
      {
        // Form data is dictionary not a body object
        formData: {
          id: z.string(),
          message: z.string(),
        },
      },
      async ({ formData }) => {
        expectTypeOf(formData).toEqualTypeOf<{
          id: string
          message: string
        }>()

        return Response.json(formData, { status: 200 })
      },
    )

    const request = new Request('http://localhost:3000/', {
      body: new URLSearchParams({
        pid: '408f1c9d-25b7-4e0a-b491-1a0b14999fc8',
        unknown: 'This is a tweet!',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid form data')
  })

  test('returns a custom response for invalid form data', async () => {
    const POST = createSafeRouteHandler(
      {
        formData: {
          id: z.string(),
          message: z.string(),
        },
        onFormDataValidationErrorResponse: (issues) => {
          expect(issues).toHaveLength(2)
          return new Response('Custom error', { status: 400 })
        },
      },
      async ({ formData }) => Response.json(formData, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: new URLSearchParams({
        pid: '408f1c9d-25b7-4e0a-b491-1a0b14999fc8',
        unknown: 'This is a tweet!',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Custom error')
  })

  test('returns a 500 for missing form data', async () => {
    const POST = createSafeRouteHandler(
      {
        formData: {
          id: z.string(),
          message: z.string(),
        },
      },
      async ({ formData }) => Response.json(formData, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: '--foo\r\nContent-Disposition: form-data; name="x"\r\n\r\n1\r\n--foo--',
      headers: {
        'Content-Type': 'multipart/form-data', // MISSING boundary!
      },
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(500)
    expect(data).toBe('Internal server error')
  })

  test('returns a 405 for invalid method', async () => {
    const GET = createSafeRouteHandler(
      {
        formData: {
          id: z.string(),
          message: z.string(),
        },
      },
      async ({ formData }) => Response.json(formData, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(405)
    expect(data).toBe('Invalid method for request form data')
  })

  test('returns a 415 for invalid content type', async () => {
    const POST = createSafeRouteHandler(
      {
        formData: {
          id: z.string(),
          message: z.string(),
        },
      },
      async ({ formData }) => Response.json(formData, { status: 200 }),
    )

    const request = new Request('http://localhost:3000/', {
      body: new URLSearchParams({
        id: '408f1c9d-25b7-4e0a-b491-1a0b14999fc8',
        message: 'This is a tweet!',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const response = await POST(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(415)
    expect(data).toBe('Invalid content type for request form data')
  })
})

describe('combined validations - ordered', () => {
  test('validates segments and search params correctly', async () => {
    const GET = createSafeRouteHandler(
      {
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, searchParams }) =>
        Response.json({ searchParams, segments }, { status: 200 }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/rooms?query=liveblocks&page=2',
    )
    const response = await GET(request, {
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({
      searchParams: { page: 2, query: 'liveblocks' },
      segments: {
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      },
    })
  })

  test('returns a 400 response for invalid segments and valid search params', async () => {
    const GET = createSafeRouteHandler(
      {
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, searchParams }) =>
        Response.json({ searchParams, segments }, { status: 200 }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/rooms?query=liveblocks&page=2',
    )
    const response = await GET(request, {
      params: Promise.resolve({
        accid: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        pjid: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid segments')
  })

  test('returns a 400 response for valid segments and invalid search params', async () => {
    const GET = createSafeRouteHandler(
      {
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, searchParams }) =>
        Response.json({ searchParams, segments }, { status: 200 }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/rooms?q=liveblocks&page=2',
    )

    const response = await GET(request, {
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid search params')
  })

  test('validates segments and body correctly', async () => {
    const POST = createSafeRouteHandler(
      {
        body: object({
          apiKey: string,
          name: string,
          systemPrompt: string,
        }),
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, body }) => Response.json({ body, segments }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/copilots',
      {
        body: JSON.stringify({
          apiKey: 'sk_ai_copilot_key',
          name: 'Super Butler',
          systemPrompt: 'You are an expert at being a butler for customers.',
        }),
        method: 'POST',
      },
    )
    const response = await POST(request, {
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({
      body: {
        apiKey: 'sk_ai_copilot_key',
        name: 'Super Butler',
        systemPrompt: 'You are an expert at being a butler for customers.',
      },
      segments: {
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      },
    })
  })

  test('returns a 400 for invalid body', async () => {
    const POST = createSafeRouteHandler(
      {
        body: object({
          apiKey: string,
          name: string,
          systemPrompt: string,
        }),
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, body }) => Response.json({ body, segments }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/copilots',
      {
        body: JSON.stringify({
          foo: 'bar',
        }),
        method: 'POST',
      },
    )
    const response = await POST(request, {
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })

    const data = await response.text()
    expect(response.status).toBe(400)
    expect(data).toBe('Invalid body')
  })
})

describe('framework validation agnostic', () => {
  test('validates correctly no matter what framework is used', async () => {
    const POST = createSafeRouteHandler(
      {
        body: z.object({
          apiKey: z.string(),
          name: z.string(),
          systemPrompt: z.string(),
        }),
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, body }) => Response.json({ body, segments }),
    )

    const request = new Request(
      'http://localhost/accounts/0e0378fd-808d-4e1c-8707-bb5c918c1ed2/projects/141399a5-14c5-47aa-bc04-2a281380b6e3/copilots',
      {
        body: JSON.stringify({
          apiKey: 'sk_ai_copilot_key',
          name: 'Super Butler',
          systemPrompt: 'You are an expert at being a butler for customers.',
        }),
        method: 'POST',
      },
    )
    const response = await POST(request, {
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toStrictEqual({
      body: {
        apiKey: 'sk_ai_copilot_key',
        name: 'Super Butler',
        systemPrompt: 'You are an expert at being a butler for customers.',
      },
      segments: {
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      },
    })
  })
})
