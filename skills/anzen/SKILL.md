---
name: anzen
description: Guides use of @sugardarius/anzen for type-safe Next.js App Router server actions, route handlers, and page/layout Server Components with Standard Schema validation and optional authorization. Use when the user works with this package, safe server actions, route handlers, RSC pages or layouts, or Standard Schema–based input validation in Next.js.
---

# Anzen (`@sugardarius/anzen`)

Type-safe factories for Next.js App Router: **server actions**, **route handlers**, and **page / layout Server Components**. Validation is [Standard Schema](https://standardschema.dev/)–compatible (Zod, Valibot, decoders, etc.). Peer dependency: Next.js `^14 || ^15 || ^16`.

## Installation (skill)

Install with the [skills CLI](https://github.com/vercel-labs/skills) (`npx skills add`). It discovers this skill at `skills/anzen/SKILL.md` in the repository.

**Remote — GitHub shorthand** (recommended; same as `https://github.com/SugarDarius/anzen`):

```bash
npx skills add SugarDarius/anzen
```

**Remote — full URL**:

```bash
npx skills add https://github.com/SugarDarius/anzen
```

**Remote — this skill directory only** (same pattern as the CLI docs for a path under `tree/…/skills/…`):

```bash
npx skills add https://github.com/SugarDarius/anzen/tree/main/skills/anzen
```

**Select by name** when installing from a source that lists several skills: `--skill anzen`.

**Local clone**: use the **repository root** (the directory that contains `skills/anzen/`, not the skill folder alone), for example:

```bash
npx skills add /path/to/anzen
```

## When to Use

- Implementing or refactoring **Next.js server actions** with validated input and optional auth context.
- Implementing **Route Handlers** (`GET` / `POST` / …) with validated segments, search params, JSON body, or form data, plus optional auth.
- Wrapping **page** or **layout** Server Components with validated `params` / `searchParams` and optional auth.
- Choosing validation libraries: any schema that implements Standard Schema; schemas can be **mixed** per option (e.g. Zod for segments, decoders for body) where the API accepts a dictionary vs a single schema.

Do **not** assume every handler must use a factory: empty options still add **default error handling** (see [Fair use](#fair-use) and **Fair use note** in each [API doc](https://github.com/SugarDarius/anzen/tree/main/www/content/docs)).

## Steps

1. **Pick the factory** matching the file type (server action, route handler, page RSC, layout RSC).
2. **Import** from `@sugardarius/anzen` or `@sugardarius/anzen/server-components` (see [Imports](#imports)).
3. **Define options**: optional `id`, `debug`, `authorize`, and validation keys (`input`, `segments`, `searchParams`, `body`, `formData` as applicable). Use **synchronous** Standard Schema `validate` only (see [Validation](#validation)).
4. **Implement the second argument**: the handler receives a context object with `auth`, validated fields, and (for server actions) `id` / `tagError` as typed by the library.
5. **Customize errors** only when needed: `onError` / `onInputValidationError` for server actions; `onErrorResponse` and per-field `on*ValidationErrorResponse` for route handlers; `onError` / `onSegmentsValidationError` / `onSearchParamsValidationError` for server components.

## Imports

| Factory                           | Package export                         |
| --------------------------------- | -------------------------------------- |
| `createSafeServerAction`          | `@sugardarius/anzen`                   |
| `createSafeRouteHandler`          | `@sugardarius/anzen`                   |
| `createSafePageServerComponent`   | `@sugardarius/anzen/server-components` |
| `createSafeLayoutServerComponent` | `@sugardarius/anzen/server-components` |

## Authorization

| Surface               | `authorize` behavior                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Route handler**     | Returns **auth context** or a **`Response`** (e.g. 401). If it returns `Response`, that becomes the route response.                                    |
| **Server action**     | Returns auth context or **never** (throw, or Next.js navigation helpers). Failures become structured **unauthorized** results when `authorize` throws. |
| **Page / layout RSC** | Returns auth context or **never** (`unauthorized()`, `notFound()`, `redirect`, etc.).                                                                  |

`AuthContext` is a `Record<string, unknown>`; use a consistent shape (e.g. `{ user }`) across the app.

## Validation

- Every schema must satisfy **Standard Schema**. The library calls `validate` and **requires a synchronous result**; if `validate` returns a `Promise`, the factory throws.
- **Dictionaries** (`StandardSchemaDictionary`): use for route/page **`segments`**, **`searchParams`**, and route **`formData`** (field name → schema).
- **Single object schema** (`StandardSchemaV1`): use for server action **`input`** and route **`body`** (entire JSON body).
- **`body` and `formData`** on route handlers are **mutually exclusive**.

## Server actions: results and errors

The action returns `Promise<SafeServerActionResult<...>>`: either `{ success: true, output }` or `{ success: false, error }`. Error `code` values include `VALIDATION_ERROR`, `UNAUTHORIZED_ERROR`, `SERVER_ERROR`, plus **tagged** errors from `tagError` in the handler context. Prefer handling navigation in the UI; `onError` / `onInputValidationError` are for shaping error **context**, not for `redirect` / `throw` (see types in the package).

## Fair use

If no validation or auth is needed, a plain `async function` or `export function GET()` is often enough. `createSafeRouteHandler({}, handler)` and similar still add **default try/catch** behavior (e.g. 500 for routes) compared to a bare export—only use the factory when that tradeoff is intentional.

## Maintainers (this repository)

- Library source: `src/` (`server-action/`, `route-handler/`, `server-components/`, `standard-schema.ts`).
- **Test**: `pnpm run test` · **Lint**: `pnpm run lint` · **Build**: `pnpm run build` (tsup).

## Quick reference

Reference files live in [`references/`](references/). Read the **References** list below and open the files that match the task (for example `references/server-actions.md` when editing server actions).

## References

- **`validation`**: Standard Schema, synchronous `validate`, dictionary vs single-object schemas, `body` vs `formData`. File: [references/validation.md](references/validation.md).
- **`authorization`**: How `authorize` works for route handlers, server actions, and RSCs; what each receives. File: [references/authorization.md](references/authorization.md).
- **`server-actions`**: `createSafeServerAction` options, handler context, result and error codes. File: [references/server-actions.md](references/server-actions.md).
- **`route-handlers`**: `createSafeRouteHandler` options and handler signature. File: [references/route-handlers.md](references/route-handlers.md).
- **`server-components`**: `createSafePageServerComponent` and `createSafeLayoutServerComponent`, base and layout slot options. File: [references/server-components.md](references/server-components.md).

## Learn more

Documentation source in-repo: [`www/content/docs/`](https://github.com/SugarDarius/anzen/tree/main/www/content/docs).

- Overview, examples, validation rules: [index.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/index.mdx)
- Guided setup (validation & authorization): [get-started.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/get-started.mdx)
- API reference (includes fair-use notes per factory): [server-action.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/server-action.mdx), [route-handler.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/route-handler.mdx), [page-server-component.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/page-server-component.mdx), [layout-server-component.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/layout-server-component.mdx)
