A fast, framework validation agnostic, type-safe factory for creating Next.JS App Router route handlers.

- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🧠 Focused functionalities, use only features you want.
- 🔒 Type-safe.
- 🧹 Clean API.

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

      return session.user
    },
  },
  async (ctx, req): Promise<Response> => {
    return Response.json({ user: ctx.auth.user }, { status: 200 })
  }
)
```

# License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
