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

export const GET = createSafeRouteHandler(
  { name: 'My safe route handler' },
  async (ctx, req): Promise<Response> => {
    return Response.json({}, { status: 200 })
  }
)
```
