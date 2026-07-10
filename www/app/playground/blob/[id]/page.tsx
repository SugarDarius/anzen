import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import { string, optional } from 'decoders'
import { notFound } from 'next/navigation'

export default createSafePageServerComponent(
  {
    authorize: async ({ segments }) => {
      if (segments.id !== 'vercel') {
        notFound()
      }

      return { user: 'page:John Doe' }
    },
    id: 'playground/blob/[id]/page',
    searchParams: {
      q: optional(string),
    },
    segments: {
      id: string,
    },
  },
  async ({ segments, searchParams, auth }) => {
    console.log('auth', auth)
    return (
      <div>
        Authenticated as {auth.user} <br />
        Blob: {segments.id} / Query: {searchParams.q ?? 'No query'}
      </div>
    )
  },
)
