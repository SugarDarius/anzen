# Server actions (`createSafeServerAction`)

Import: `@sugardarius/anzen`.

API reference: [server-action.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/server-action.mdx).

## Options

| Option | Purpose |
| --- | --- |
| `id?` | Identifier for logs / debugging |
| `debug?` | Verbose logging |
| `input?` | **StandardSchemaV1** for the action input |
| `authorize?` | `(params) => AuthContext \| never`; `params` includes `id` and `input` when `input` is set |
| `onError?` | Map unknown errors to `ServerActionErrorContext` — **not** for bare `throw` or `redirect` in the callback (see package JSDoc) |
| `onInputValidationError?` | Map validation issues to error context — same navigation/`throw` caveat |

## Handler context

Illustrative members: `id`, validated `input` (if configured), `auth` (if `authorize` returns), `tagError` for domain-specific tagged errors. See exported types in `server-action/types.ts`.

## Result shape

Returns `Promise<SafeServerActionResult<TOutput, TError>>`:

- Success: `{ success: true, output }`
- Failure: `{ success: false, error }` with discriminated `error.code`:

| `code`               | Meaning                                              |
| -------------------- | ---------------------------------------------------- |
| `VALIDATION_ERROR`   | Input validation failed                              |
| `UNAUTHORIZED_ERROR` | `authorize` threw                                    |
| `SERVER_ERROR`       | Uncaught error in handler (after `onError` handling) |
| _(custom string)_    | Tagged errors via `tagError`                         |

## Inferring the result type

Use `InferSafeServerActionResult<typeof myAction>` instead of manually writing `SafeServerActionResult<TOutput, SafeServerActionError>`. Pass the action reference, not a call result.

```ts
import type { InferSafeServerActionResult } from '@sugardarius/anzen'
import { signInWithEmail } from '~/actions/sign-in-with-email'

export type SignInWithEmailResult = InferSafeServerActionResult<
  typeof signInWithEmail
>
```

Equivalent to `Awaited<ReturnType<typeof myAction>>`, but named and constrained to safe server actions.
