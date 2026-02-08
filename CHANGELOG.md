## [Unreleased]

## [2.2.0] - 2026-02-08

- Add support for [Next.js parallel routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) with new `experimental_slots` option in `createSafeLayoutServerComponent`.
- Remove `TypeScript` as peer dependency.

## [2.1.2] - 2025-12-24

- Fix `onError` callback call in `createSafePageServerComponent` and `createSafeLayoutServerComponent`. Now it's not called anymore for Next.js native errors.

## [2.1.1] - 2025-12-11

- Update internal logging.

## [2.1.0] - 2025-11-21

- Silent Next.js native errors. They won't clutter logs anymore.
- Update documentations and meta files.

## [2.0.1] - 2025-11-13

- Package/repo related changes.

## [2.0.0] - 2025-11-13

- Introducing new functions `createSafePageServerComponent` and `createSafeLayoutServerComponent` exported from `@sugardarius/anzen/server-components` to validate segments, search params, and authorize Page and Layout files in Next.js.
- Add doc in website for new functions `createSafePageServerComponent` and `createSafeLayoutServerComponent`.
- Add validated props in the authorize option params for `createSafeRouteHandler`.

## [1.1.3] - 2025-10-28

- Add support for Next.js 16 🚀

## [1.1.2] - 2025-10-10

- Update type management when using `NextRequest`.

## [1.1.1] - 2025-07-16

- Fix typo in logs when the handler throws.

## [1.1.0] - 2025-07-14

- Make request as a generic type to use `NextRequest` gracefully.
- Clone original request to avoid side effects and to make it consumable in the `authorize` function.

## [1.0.2] - 2025-06-12

- Internal refactoring.
- Route handler function execution time is now logged into the console.
- Original request is now cloned when consuming the body for validation operations.

## [1.0.1] - 2025-05-20

- Update jsdoc.
- Update README.md.
- Public announcement.

## [1.0.0] - 2025-05-09

- Package public release (not officially announced).

## [0.1.2] - 2025-05-02

- Allow workflow permissions

## [0.1.1] (2025-05-02)

- Patch (private).

## [0.1.0] (2025-05-02)

- Initial release (private).
