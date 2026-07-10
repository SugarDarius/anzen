# Server Components (`createSafePageServerComponent`, `createSafeLayoutServerComponent`)

Import: `@sugardarius/anzen/server-components`.

API reference: [page-server-component.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/page-server-component.mdx), [layout-server-component.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/layout-server-component.mdx).

Authorization patterns: [authorization.md](authorization.md).

## Base options (`ServerComponentBaseOptions`)

Shared by page and layout:

| Option | Purpose |
| --- | --- |
| `id?` | Identifier for logs / debugging |
| `debug?` | Verbose logging |
| `segments?` | **Dictionary** of schemas for dynamic `params` |
| `onSegmentsValidationError?` | Issues → `never` (default: throw / log per package) |
| `onError?` | Unhandled errors in the component |

## Page-only options

| Option | Purpose |
| --- | --- |
| `searchParams?` | **Dictionary** of schemas for `searchParams` |
| `onSearchParamsValidationError?` | Search param validation issues |
| `authorize?` | See [authorization.md](authorization.md) |

The default export is an async wrapper: Next passes `params` and `searchParams`; the inner function receives validated `segments`, `searchParams`, and `auth` as configured.

## Layout-only options

| Option | Purpose |
| --- | --- |
| `authorize?` | Same contract as page (with layout `authorize` params) |
| `experimental_slots?` | Parallel routes: slot names as a readonly string tuple |

The inner function receives `children` and, when `experimental_slots` is set, the corresponding slot props (`React.ReactNode`) like standard Next.js layout props.
