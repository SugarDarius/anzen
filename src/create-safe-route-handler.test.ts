import { describe, test, expect, expectTypeOf } from 'vitest'
import { string, numeric } from 'decoders'
import { createSafeRouteHandler } from './create-safe-route-handler'

const paramsPromise = (params: Record<string, unknown>) =>
  Promise.resolve(params)

describe('on error response', () => {
  test('returns a 500 response for unexpected errors', async () => {
    const GET = createSafeRouteHandler(
      { id: 'internal-server-error' },
      async () => {
        throw new Error('Unexpected error')
      }
    )

    const request = new Request('http://localhost:3000/')
    const response = await GET(request, { params: Promise.resolve({}) })
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
    const response = await GET(request, { params: Promise.resolve({}) })
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
      params: paramsPromise({ id: 'suzuka', page: '256' }),
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
      params: paramsPromise({ ppid: 'suzuka', page: 'unknown' }),
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
      params: paramsPromise({ ppid: 'suzuka', page: 'unknown' }),
    })
    const data = await response.text()

    expect(response.status).toBe(400)
    expect(data).toBe('Custom error')
  })
})
