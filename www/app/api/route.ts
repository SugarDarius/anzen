import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  { name: 'Simple Safe Route Handler' },
  async () => {
    return Response.json({ message: 'Hey 👋🏻' })
  }
)
