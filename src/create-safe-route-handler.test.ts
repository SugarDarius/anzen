import {
  describe,
  test,
  expect,
  expectTypeOf,
  afterEach,
  beforeEach,
  vi,
} from 'vitest'
import { string, numeric } from 'decoders'
import { createSafeRouteHandler } from './create-safe-route-handler'

describe('default context', () => {
  test('provides default context', async () => {
    const GET = createSafeRouteHandler({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<{
        readonly id: string
        readonly url: URL
      }>()
      expect(ctx.id).toBe('[unknown:route:handler]')
      expect(ctx.url).toBeInstanceOf(URL)
      expect(ctx.url.href).toBe('http://localhost:3000/')

      return Response.json({ message: 'Hello, world!' }, { status: 200 })
    })

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Hello, world!' })
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
      expect(id).toBe('[unknown:route:handler]')
      return Response.json({ message: 'Hello, world!' }, { status: 200 })
    })

    const request = new Request('http://localhost:3000/')
    await GET(request, { params: undefined })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running route handler '[unknown:route:handler]'`
    )
  })

  test('should use custom id if provided', async () => {
    const id = 'custom-id'
    const GET = createSafeRouteHandler({ id }, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe('custom-id')
      return Response.json({ message: 'Hello, world!' }, { status: 200 })
    })

    const request = new Request('http://localhost:3000/')
    await GET(request, { params: undefined })

    expect(logSpy).toHaveBeenCalledWith(`🔄 Running route handler '${id}'`)
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
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ user })
  })

  test('should return a 401 response for unauthorized requests', async () => {
    const GET = createSafeRouteHandler(
      {
        authorize: () => new Response('Unauthorized', { status: 401 }),
      },
      async () => {
        return Response.json({ message: 'Hello, world!' }, { status: 200 })
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(401)
    expect(data).toBe('Unauthorized')
  })
})

describe('on error response', () => {
  test('returns a 500 response for unexpected errors', async () => {
    const GET = createSafeRouteHandler(
      { id: 'internal-server-error' },
      async () => {
        throw new Error('Unexpected error')
      }
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
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: undefined })
    const data = await response.text()

    expect(response.status).toBe(500)
    expect(data).toBe('Custom error response')
  })
})

describe('segments validation', () => {
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
          { status: 200 }
        )
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ id: 'suzuka', page: 256 })
  })

  test('returns a 400 response for invalid segments', async () => {
    const GET = createSafeRouteHandler(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        return Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 }
        )
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ ppid: 'suzuka', page: 'unknown' }),
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Invalid segments')
  })

  test('returns a custom response for invalid segments', async () => {
    const GET = createSafeRouteHandler(
      {
        segments: { id: string, page: numeric },
        onSegmentsValidationErrorResponse: (issues) => {
          expect(issues.length).toBe(2)
          return new Response('Custom error', { status: 400 })
        },
      },
      async (ctx) => {
        return Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 }
        )
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, {
      params: Promise.resolve({ ppid: 'suzuka', page: 'unknown' }),
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
      async (ctx) => {
        return Response.json(
          { id: ctx.segments.id, page: ctx.segments.page },
          { status: 200 }
        )
      }
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
