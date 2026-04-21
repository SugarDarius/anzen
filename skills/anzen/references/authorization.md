# Authorization

Narrative examples: [README.md](../../../README.md).

`AuthContext` in the library is `Record<string, unknown>`. Use one consistent shape in your app (e.g. `{ user: SessionUser }`).

## By surface

| Surface | `authorize` contract |
|---------|----------------------|
| **Route handler** | Returns **auth context** or a **`Response`**. If you return `Response`, it is sent as the handler response (e.g. 401 with empty body). |
| **Server action** | Returns **auth context** or **never** (throw on failure). Throwing produces a structured **unauthorized** error in the action result. Navigation helpers from Next may be used where appropriate in your stack. |
| **Page / layout RSC** | Returns **auth context** or **never**. Typical patterns: `unauthorized()` from `next/navigation`, `notFound()`, `redirect()`, or thrown errors. |

## Parameters available to `authorize`

- **Server action**: `{ id, input? }` — `input` is present only when an `input` schema is configured (already validated).
- **Route handler**: `{ id, url, req, segments?, searchParams?, body?, formData? }` — dynamic keys match what you configured; `req` is a clone safe to consume.
- **Page RSC**: `{ id, segments?, searchParams? }` — validated route data when configured.
- **Layout RSC**: `{ id, segments? }` — validated segments when configured.
