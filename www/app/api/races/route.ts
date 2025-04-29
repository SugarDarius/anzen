import { object, string } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    name: 'POST route',
    body: object({
      name: string,
      location: string,
    }),
  },
  async (ctx) => {
    return Response.json({ race: ctx.body })
  }
)
