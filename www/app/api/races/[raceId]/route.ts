import { createSafeRouteHandler } from '@sugardarius/anzen'
import { z } from 'zod'

export const GET = createSafeRouteHandler(
  {
    id: 'Dynamic segments <decoders>',
    segments: {
      raceId: z.string(),
    },
  },
  async (ctx) => Response.json({ segments: ctx.segments }),
)
