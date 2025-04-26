A fast, framework validation agnostic, type-safe factories for Next.JS App Router route handlers.

- 🧠 Focused functionalities, use only features you want.
- 🧹 Clean API.
- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🔒 Type-safe.

# Install

```sh
npm i @anzen/next-safe-route-handler
```

# Usage

```tsx
import { createSafeRouteHAndler } from '@anzen/next-safe-route-handler'

export const GET = createSafeRouteHAndler(
    {}, 
    async (ctx, req): Promise<NextResponse> => {
    return NextResponse.json({}, { status: 200 })
})
```