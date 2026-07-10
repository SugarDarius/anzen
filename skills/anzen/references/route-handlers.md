# Route handlers (`createSafeRouteHandler`)

Import: `@sugardarius/anzen`.

API reference: [route-handler.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/route-handler.mdx).

Validation rules for `body` / `formData` and Standard Schema: [validation.md](validation.md).

## Options

| Option | Purpose |
| --- | --- |
| `id?` | Identifier for logs / debugging |
| `debug?` | Verbose logging |
| `segments?` | **Dictionary** of Standard Schema for dynamic segments |
| `searchParams?` | **Dictionary** for query string |
| `body?` | **Single** Standard Schema for JSON body |
| `formData?` | **Dictionary** for multipart or urlencoded fields (**not** with `body`) |
| `authorize?` | Returns `AuthContext` or `Response` |
| `onErrorResponse?` | Uncaught errors → `Response` (default ~500) |
| `onSegmentsValidationErrorResponse?` | Default ~400 |
| `onSearchParamsValidationErrorResponse?` | Default ~400 |
| `onBodyValidationErrorResponse?` | Default ~400 |
| `onFormDataValidationErrorResponse?` | Default ~400 |

## Handler signature

The handler receives a **context object** (validated `segments`, `searchParams`, `body`, `formData`, `auth` as configured) and the **`Request`** as the **second argument**. Return a `Response` (e.g. `Response.json(...)`).
