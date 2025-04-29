import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    name: 'Authorized route',
    authorize: async ({ req, url }) => {
      console.log('Authorizing request', { req, url })
      return { user: 'John Doe' }
    },
  },
  async (ctx) => {
    return Response.json({ message: `Hello ${ctx.auth.user}` })
  }
)
