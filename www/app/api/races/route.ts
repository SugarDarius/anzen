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
  async (ctx, req) => {
    console.log('req', req)
    return Response.json({ race: ctx.body })
  }
)
