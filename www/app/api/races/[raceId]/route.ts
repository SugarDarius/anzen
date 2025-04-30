import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    id: 'Dynamic segments <decoders>',
    segments: {
      raceId: z.string(),
    },
  },
  async (ctx) => {
    return Response.json({ segments: ctx.segments })
  }
)
