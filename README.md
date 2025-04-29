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

      return { user: session.user }
    },
  },
  async (ctx, req): Promise<Response> => {
    return Response.json({ user: ctx.auth.user }, { status: 200 })
  }
)
```

# Fair use

Please note that if you're not using any of the proposed options in `createSafeRouteHandler` it means you're surely don't need it.

Feel free to open an issue or a PR if you think a relevant option could be added 🙂

# License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
