A fast, framework validation agnostic, type-safe factory for creating Next.JS App Router route handlers.

- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🧠 Focused functionalities, use only features you want.
- 🔒 Type-safe.
- 🧹 Clean API.

# Safe Route Handlers

Create type-safe route handlers 👇🏻

# Install

```sh
npm i @sugardarius/anzen
```

# Usage

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {},
  async (ctx, req): Promise<NextResponse> => {
    return NextResponse.json({}, { status: 200 })
  }
)
```
