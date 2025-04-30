import { object, string } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    id: 'POST route',
    segments: {
      app: string,
    },
    body: object({
      name: string,
      location: string,
    }),
  },
  async (ctx, req) => {
    console.log('req', req)
    console.log(ctx.segments.app)
    return Response.json({ race: ctx.body })
  }
)
