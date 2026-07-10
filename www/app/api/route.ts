import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler({ id: 'Simple' }, async () =>
  Response.json({ message: 'Hey 👋🏻' }),
)
