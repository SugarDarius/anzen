# Validation and Standard Schema

Docs: [index.mdx](https://github.com/SugarDarius/anzen/blob/main/www/content/docs/index.mdx) (framework validation, synchronous validation).

## Rules

- Every schema must implement [Standard Schema](https://standardschema.dev/) (`StandardSchemaV1` or dictionary types from the package).
- The library invokes `validate` and **requires a synchronous result**. If `validate` returns a `Promise`, the factory throws (see `standard-schema.ts` in the library).
- You may **mix** schema libraries per option (e.g. Zod for `segments`, decoders for `searchParams`) as long as each field satisfies the expected Standard Schema shape.

## Dictionary vs single schema

| API shape | Use for |
|-----------|---------|
| **Dictionary** (`StandardSchemaDictionary`) | Route/page **`segments`**, **`searchParams`**, route **`formData`** — one schema per key. |
| **Single object schema** (`StandardSchemaV1`) | Server action **`input`**; route **`body`** — one schema for the whole JSON object. |

## Route handler: `body` and `formData`

- **`body`** and **`formData`** are **mutually exclusive**.
- **`body`**: JSON only; typical methods `POST` / `PUT` / `PATCH`; `Content-Type: application/json` (see package types for status codes when method or content type is wrong).
- **`formData`**: `multipart/form-data` or `application/x-www-form-urlencoded`; validate fields via a **dictionary** of schemas.
