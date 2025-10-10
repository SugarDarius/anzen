import { createSafeRouteHandler } from '@sugardarius/anzen'
import { NextRequest } from 'next/server'

export const GET = createSafeRouteHandler(
  {
    id: 'Authorized route',
    authorize: async ({ url, req }) => {
      console.log('Authorizing request', { req, url })
      console.log('headers', Object.fromEntries(req.headers))
      return { user: 'John Doe' }
    },
  },
  async (ctx, req: NextRequest) => {
    console.log('Request', { req })
    return Response.json({ message: `Hello ${ctx.auth.user}` })
  }
)
