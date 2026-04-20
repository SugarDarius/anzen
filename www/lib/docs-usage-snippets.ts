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

export const docsUsageRouteHandler = `import { object, string, number } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'
import { auth } from '~/lib/auth'

export const POST = createSafeRouteHandler(
  {
    authorize: async ({ req }) => {
      const session = await auth.getSession(req)
      if (!session) {
        return new Response(null, { status: 401 })
      }

      return { user: session.user }
    },
  },
  async ({ auth, body }, req): Promise<Response> => {
    return Response.json({ user: auth.user, body }, { status: 200 })
  }
)`

export const docsUsagePageServerComponent = `import { unauthorized } from 'next/navigation'
import { string } from 'decoders'
import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

import { auth } from '~/lib/auth'
import { getAccount } from '~/lib/db'

import { AccountSummary } from '~/components/account-summary'

export default createSafePageServerComponent(
  {
    authorize: async ({ segments }) => {
      const session = await auth.getSession()
      if (!session) {
        unauthorized()
      }

      return { user: session.user }
    },
    segments: {
      accountId: string,
    },
  }, async ({ auth, segments })  => {
    const account = await getAccount({ id: segments.accountId})
    return <AccountSummary user={auth.user} account={account} />
  }
)`

export const docsUsageLayoutServerComponent = `import { unauthorized } from 'next/navigation'
import { string } from 'decoders'
import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'

import { auth } from '~/lib/auth'
import { getAccount } from '~/lib/db'

import { AccountHeader } from '~/components/account-header'

export default createSafeLayoutServerComponent(
  {
    authorize: async ({ segments }) => {
      const session = await auth.getSession()
      if (!session) {
        unauthorized()
      }

      return { user: session.user }
    },
    segments: {
      accountId: string,
    },
  }, async ({ auth, segments, children }) => {
    const account = await getAccount({ id: segments.accountId})
    return (
      <div>
        <AccountHeader user={auth.user} accountId={segments.accountId} />
        {children}
      </div>
    )
  }
)`

/** File titles shown next to each block in docs (`title="…"` in fenced code). */
export const docsUsageTitles = {
  serverAction: 'actions/create-thread.ts',
  routeHandler: 'api/authorize/route.ts',
  pageServerComponent: 'app/[accountId]/page.tsx',
  layoutServerComponent: 'app/[accountId]/layout.tsx',
} as const
