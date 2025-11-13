import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'
import { string } from 'decoders'
import { notFound } from 'next/navigation'

export default createSafeLayoutServerComponent(
  {
    id: 'playground/blob/[id]/layout',
    segments: {
      id: string,
    },
    authorize: async ({ segments }) => {
      if (segments.id !== 'vercel') {
        notFound()
      }

      return { user: 'layout:John Doe' }
    },
  },
  async ({ children, auth }) => {
    console.log('auth', auth)
    return <div>{children}</div>
  }
)
