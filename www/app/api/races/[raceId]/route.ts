import { string } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    name: 'Dynamic segments <string>',
    segments: {
      raceId: string,
    },
  },
  async (ctx) => {
    return Response.json({ segments: ctx.segments })
  }
)
