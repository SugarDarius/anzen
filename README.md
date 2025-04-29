A flexible, framework validation agnostic, type-safe factory for creating Next.JS App Router route handlers.

- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🧠 Focused functionalities, use only features you want.
- 🧹 Clean and flexible API.
- 🔒 Type-safe.
- 🌱 Dependency free.

# Install

```sh
npm i @sugardarius/anzen
```

# Usage

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'
import { auth } from '~/lib/auth'

export const GET = createSafeRouteHandler(
  {
    authorize: async ({ req }) => {
      const session = await auth.getSession(req)
      if (!session) {
        return new Response(null, { status: 401 })
      }

      return { user: session.user }
    },
  },
  async (ctx, req): Promise<Response> => {
    return Response.json({ user: ctx.auth.user }, { status: 200 })
  }
)
```

The example above shows how to use the factory to authorize your requests.

# Synchronous validations

The factory do not supports async validations. As required by the [Standard Schema](https://github.com/standard-schema/standard-schema) common interface. In the context of a route handler it's not necessary.

If you define an async validation then the route handler will throw an error. It's the only case where an error is thrown.

# Error handling

By design the factory will catch any error thrown in the route handler will return a simple response with `500` status.

You can customize the error response if you want to fine tune error response management.

```tsx
import { HttpError, DbUnknownError } from '~/lib/errors'
import { db } from '~/lib/db'

export const GET = createSafeRouteHandler(
  {
    onErrorResponse: async (err: unknown): Promise<Response> => {
      if (err instanceof HttpError) {
        return new Response(err.message, { status: err.status })
      } else if (err instanceof DbUnknownError) {
        return new Response(err.message, { status: err.status })
      }

      return new Response('Internal server error', { status: 500 })
    },
  },
  async (): Promise<Response> => {
    const [data, err] = await db.findUnique({ id: 'liveblocks' })

    if (err) {
      throw new DbUnknownError(err.message, 500)
    }

    if (data === null) {
      throw new HttpError(400)
    }

    return Response.json({ data }, { status: 200 })
  }
)
```

# Fair use note

Please note that if you're not using any of the proposed options in `createSafeRouteHandler` it means you're surely don't need it.

Feel free to open an issue or a PR if you think a relevant option could be added 🙂

# License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
