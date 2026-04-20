/**
 * Code samples from the “Usage” section on the docs home page (`content/docs/index.mdx`).
 * Kept in one place so the marketing page can mirror the docs verbatim.
 */
export const docsUsageServerAction = `'use server'

import { object, string, datelike } from 'decoders'
import { createSafeServerAction } from '@sugardarius/anzen'

import { auth } from '~/lib/auth'
import { db } from '~/lib/db'

export const createThread = createSafeServerAction(
  {
    id: 'create-thread-action',
    input: object({
      spaceId: string,
      createdAt: datelike,
      comment: object({
        createdAt: datelike,
        content: string,
      }),
    }),
    authorize: async ({ input }) => {
      const session = await auth()
      if (!session.user) {
        throw new Error('user is not authenticated')
      }

      if (!session.access.includes(input.spaceId)) {
        throw new Error('user has not access')
      }

      return { user: session.user }
    },
  },
  async ({ auth, input, id }) => {
    const inserted = await db.createThread({
      thread: { ...input, authorId: auth.user.id },
    })

    return { inserted, actionId: id }
  }
)`

/** File titles shown next to each block in docs (`title="…"` in fenced code). */
export const docsUsageTitles = {
  serverAction: 'actions/create-thread.ts',
} as const
