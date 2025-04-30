import { describe, test, expect, expectTypeOf } from 'vitest'
import { string, numeric } from 'decoders'
import { createSafeRouteHandler } from './create-safe-route-handler'

const paramsPromise = (params: Record<string, unknown>) =>
  Promise.resolve(params)

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
})
