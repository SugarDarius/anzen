import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler({ id: 'Simple' }, async () => {
  return Response.json({ message: 'Hey 👋🏻' })
})
