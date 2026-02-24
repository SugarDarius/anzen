import { createSafeRouteHandler } from '@sugardarius/anzen'
import { redirect } from 'next/navigation'

export const GET = createSafeRouteHandler(
  { id: 'redirect/nextjs' },
  async () => {
    redirect('/')
  }
)
