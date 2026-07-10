[![npm](https://img.shields.io/npm/v/%40sugardarius%2Fanzen?style=flat&labelColor=101010&color=FFC799)](https://www.npmjs.com/package/@sugardarius/anzen) [![size](https://img.shields.io/bundlephobia/minzip/%40sugardarius%2Fanzen?style=flat&labelColor=101010&label=size&color=FFC799)](https://bundlephobia.com/package/@sugardarius/anzen) [![license](https://img.shields.io/github/license/sugardarius/anzen?style=flat&labelColor=101010&color=FFC799)](https://github.com/SugarDarius/anzen/blob/main/LICENSE)

Fast, flexible, framework validation agnostic, type‑safe factories for creating [server actions](https://nextjs.org/docs/app/getting-started/mutating-data), [route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers), [page](https://nextjs.org/docs/app/api-reference/file-conventions/page) and [layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout) Server Component files in Next.js.

- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🧠 Focused functionalities, use only features you want.
- 🧹 Clean and flexible API.
- 🔒 Type-safe.
- 🌱 Dependency free. Only [Next.js](https://nextjs.org/) is required as peer dependency.
- 🪶 Lightweight.

## Install

```sh
npm i @sugardarius/anzen
```

## Usage

### Server Actions

```tsx
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
  async ({
    auth, // Auth context is inferred from the authorize function
    input, // Input is inferred from the input validation
  }) => {
    const inserted = await db.createThread({
      thread: { ...input, authorId: auth.user.id },
    })

    return { inserted }
  },
)
```

### Route Handlers

```tsx
import { object, string, number } from 'decoders'
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
    body: object({
      foo: string,
      bar: number,
    }),
  },
  async (
    {
      auth, // Auth context is inferred from the authorize function
      body, // Body is inferred from the body validation
    },
    req,
  ): Promise<Response> => {
    return Response.json({ user: auth.user, body }, { status: 200 })
  },
)
```

### Page Server Components

```tsx
import { object, string, number } from 'decoders'
import { unauthorized } from 'next/navigation'
import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'
import { auth } from '~/lib/auth'

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
      id: string,
    },
    searchParams: {
      page: number,
    },
  },
  async ({
    auth, // Auth context is inferred from the authorize function
    segments, // Segments are inferred from the segments validation
    searchParams, // Search params are inferred from the searchParams validation
  }) => {
    return <div>Hello {auth.user.name}!</div>
  },
)
```

### Layout Server Components

```tsx
import { z } from 'zod'
import { createSafeLayoutServerComponent } from '@sugardarius/anzen/server-components'
import { auth } from '~/lib/auth'
import { notFound, unauthorized } from 'next/navigation'

export default createSafeLayoutServerComponent(
  {
    segments: {
      accountId: z.string(),
    },
    authorize: async ({ segments }) => {
      const session = await auth.getSession()
      if (!session) {
        unauthorized()
      }

      const hasAccess = await checkAccountAccess(
        session.user.id,
        segments.accountId,
      )
      if (!hasAccess) {
        notFound()
      }

      return { user: session.user }
    },
  },
  async ({ auth, segments, children }) => {
    return (
      <div>
        <header>Account: {segments.accountId}</header>
        {children}
      </div>
    )
  },
)
```

## Framework validation agnostic

By design the factories are framework validation agnostic 🌟. When doing your validations you can use whatever you want as framework validation as long as it implements the [Standard Schema](https://standardschema.dev/) common interface. You can use your favorite validation library like [Zod](https://zod.dev/), [Validbot](https://valibot.dev/) or [decoders](https://decoders.cc/).

```tsx
// Route handler example
import { z } from 'zod'
import { object, string, number } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    // `zod` for segments dictionary validation
    segments: { id: z.string() },
    // `decoders` for body object validation
    body: object({
      id: number,
      name: string,
    }),
  },
  async ({ segments, body }) => {
    return Response.json({ segments, body })
  },
)
```

```tsx
// Page server component example
import { z } from 'zod'
import { string, number } from 'decoders'
import { createSafePageServerComponent } from '@sugardarius/anzen/server-components'

export default createSafePageServerComponent(
  {
    // `zod` for segments dictionary validation
    segments: { id: z.string() },
    // `decoders` for search params dictionary validation
    searchParams: {
      page: number,
    },
  },
  async ({ segments, searchParams }) => {
    return (
      <div>
        Race {segments.id} - Page {searchParams.page}
      </div>
    )
  },
)
```

## Synchronous validations

The factories do not support async validations. As required by the [Standard Schema](https://standardschema.dev/) common interface we should avoid it. In the context of route handlers and server components it's not necessary.

If you define an async validation then the factory will throw an error.

## Fair use note

Please note that if you're not using any of the proposed options in the factories it means you're surely don't need them.

```tsx
// Route handler
// Calling 👇🏻
export const GET = createSafeRouteHandler({}, async () => {
  return new Response(null, { status: 200 })
})

// is equal to declare the route handler this way 👇🏻
export function GET() {
  return new Response(null, { status: 200 })
}
// except `createSafeRouteHandler` will provide by default a native error catching
// and will return a `500` response. That's the only advantage.
```

```tsx
// Page server component
// Calling 👇🏻
export default createSafePageServerComponent({}, async () => {
  return <div>Hello</div>
})

// is equal to declare the page server component this way 👇🏻
export default async function Page() {
  return <div>Hello</div>
}
```

```tsx
// Layout server component
// Calling 👇🏻
export default createSafeLayoutServerComponent({}, async ({ children }) => {
  return <div>{children}</div>
})

// is equal to declare the layout server component this way 👇🏻
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
```

Feel free to open an issue or a PR if you think a relevant option could be added into the factories 🙂

## Requirements

The factories require Next.js `v14`, or `v15`, or `v16` as peer dependency.

## Contributing

All contributions are welcome! 🙂 Feel free to open an issue if you find a bug or create a pull request if you have a feature request.

## Credits

- Thanks to [@t3-oss/env-core](https://github.com/t3-oss/t3-env) for opening the implementation of `StandardSchemaDictionary` 🙏🏻
- Thanks to [frimousse](https://github.com/liveblocks/frimousse) for opening the release & publish workflow 🙏🏻

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
