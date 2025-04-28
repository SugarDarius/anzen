import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler({ name: 'Simple' }, async () => {
  return Response.json({ message: 'Hey 👋🏻' })
})
