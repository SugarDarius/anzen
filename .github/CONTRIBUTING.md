# Contributing to Anzen

Thanks for your interest in contributing! All contributions are welcome.

## Before you start

- **Bug reports** — use the [bug report template](https://github.com/SugarDarius/anzen/issues/new?template=bug-report.md). Include your `@sugardarius/anzen`, Next.js, and Node.js versions.
- **Feature requests** — use the [feature request template](https://github.com/SugarDarius/anzen/issues/new?template=feature-request.md). Explain the problem and the use case.
- **Security issues** — do not open a public issue. See [SECURITY.md](./SECURITY.md).

Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development setup

Requirements: Node.js 24+ and npm.

```sh
git clone https://github.com/SugarDarius/anzen.git
cd anzen
npm ci
```

Useful scripts:

```sh
npm run dev      # watch mode
npm run build    # build the package
npm run test     # run tests
npm run lint     # eslint, tsc, and package checks
npm run format   # format src/
```

## Project structure

This repo is an npm workspace with two packages:

| Path | Purpose |
| --- | --- |
| `src/` | Library source — what gets published to npm |
| `www/` | Docs site and playground (Next.js + Fumadocs) |
| `skills/` | Agent skill definitions for AI assistants |

The library is split into two entry points (see `tsup.config.ts`):

- **`@sugardarius/anzen`** — `src/index.ts` exports server actions and route handlers.
- **`@sugardarius/anzen/server-components`** — `src/server-components/` exports page and layout factories.

Each factory lives in its own folder under `src/` with co-located types, errors, and Vitest tests:

```
src/
├── server-action/       # createSafeServerAction
├── route-handler/       # createSafeRouteHandler
├── server-components/   # createSafePageServerComponent, createSafeLayoutServerComponent
├── standard-schema.ts   # Standard Schema helpers
└── utils.ts             # shared validation utilities
```

Build output goes to `dist/`. Tests live next to source files (`*.test.ts`, `*.test.tsx`). For docs or playground changes, work in `www/`.

## Pull requests

1. Open an issue first for larger changes, or reference an existing one.
2. Keep PRs focused — one concern per pull request.
3. Add or update tests when behavior changes.
4. Run `npm run build`, `npm run lint`, and `npm run test` before opening the PR.
5. Fill out the [pull request template](./PULL_REQUEST_TEMPLATE.md).

CI runs the same checks on every pull request. Maintainers will review when they can.

## Scope

Anzen provides type-safe factories for Next.js server actions, route handlers, and server components. Validations must stay synchronous and [Standard Schema](https://standardschema.dev/) compatible. Keep the API small and dependency-free.
