import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    id: 'URL query params <zod>',
    searchParams: {
      query: z.string(),
      page: z.string().optional(),
    },
  },
  async (ctx) => {
    return Response.json({ searchParams: ctx.searchParams })
  }
)
