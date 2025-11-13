import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import { string, optional } from 'decoders'
import { notFound } from 'next/navigation'

export default createSafePageServerComponent(
  {
    id: 'playground/blob/[id]/page',
    segments: {
      id: string,
    },
    searchParams: {
      q: optional(string),
    },
    authorize: async ({ segments }) => {
      if (segments.id !== 'vercel') {
        notFound()
      }

      return { user: 'page:John Doe' }
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
  }
)
