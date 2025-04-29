import { string } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    name: 'Dynamic segments <decoders>',
    segments: {
      raceId: string,
    },
  },
  async (ctx) => {
    return Response.json({ segments: ctx.segments })
  }
)
