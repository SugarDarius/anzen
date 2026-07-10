import { createSafeRouteHandler } from '@sugardarius/anzen'
import { object, string } from 'decoders'

export const POST = createSafeRouteHandler(
  {
    body: object({
      location: string,
      name: string,
    }),
    id: 'POST route',
  },
  async (ctx, req) => {
    console.log('req', req)
    return Response.json({ race: ctx.body })
  },
)
