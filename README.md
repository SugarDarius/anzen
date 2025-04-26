A fast, framework validation agnostic, type-safe factories for Next.JS App Router.

- 🧠 Focused functionalities, use only features you want.
- 🧹 Clean API.
- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🔒 Type-safe.


# Safe Route Handlers

Create type-safe route handlers 👇🏻

## Install

```sh
npm i @anzen/next-safe-route-handler
```

## Usage

```tsx
import { createSafeRouteHAndler } from '@anzen/next-safe-route-handler'

export const GET = createSafeRouteHAndler(
    {}, 
    async (ctx, req): Promise<NextResponse> => {
    return NextResponse.json({}, { status: 200 })
})
```

# Safe Server Actions
🔜 Coming soon