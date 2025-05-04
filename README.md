A flexible, framework validation agnostic, type-safe factory for creating Next.JS App Router route handlers.

- 🔧 Framework validation agnostic, use a validation library of your choice supporting [Standard Schema](https://standardschema.dev/).
- 🧠 Focused functionalities, use only features you want.
- 🧹 Clean and flexible API.
- 🔒 Type-safe.
- 🌱 Dependency free.
- 🪶 Less than 100kB unpacked.

## Install

```sh
npm i @sugardarius/anzen
```

## Usage

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'
import { auth } from '~/lib/auth'

export const GET = createSafeRouteHandler(
  {
    authorize: async ({ req }) => {
      const session = await auth.getSession(req)
      if (!session) {
        return new Response(null, { status: 401 })
      }

      return { user: session.user }
    },
  },
  async ({ auth }, req): Promise<Response> => {
    return Response.json({ user: auth.user }, { status: 200 })
  }
)
```

The example above shows how to use the factory to authorize your requests.

## Framework validation agnostic

By design the factory is framework validation agnostic 🌟. When doing your validations you can use whatever you want as framework validation as long as it implements the [Standard Schema](https://github.com/standard-schema/standard-schema) common interface. You can use your favorite validation library like [Zod](https://zod.dev/) or [decoders](https://decoders.cc/).

```tsx
import { z } from 'zod'
import { object, string, number } from 'decoders'

export const POST = createSafeRouteHandler(
  {
    // `zod` for segments dictionary validation
    segments: { id: z.string() }
    // `decoders` for body validation
    body: object({
      id: number,
      name: string,
    }),
  },
  async ({ body }) => {
    return Response.json({ body })
  }
)
```

## Synchronous validations

The factory do not supports async validations. As required by the [Standard Schema](https://github.com/standard-schema/standard-schema) common interface we should avoid it. In the context of a route handler it's not necessary.

If you define an async validation then the route handler will throw an error.

## API

Check the API and the available options to configure the factory as you wish.

### Error handling

By design the factory will catch any error thrown in the route handler will return a simple response with `500` status.

You can customize the error response if you want to fine tune error response management.

```tsx
import { HttpError, DbUnknownError } from '~/lib/errors'
import { db } from '~/lib/db'

export const GET = createSafeRouteHandler(
  {
    onErrorResponse: async (err: unknown): Promise<Response> => {
      if (err instanceof HttpError) {
        return new Response(err.message, { status: err.status })
      } else if (err instanceof DbUnknownError) {
        return new Response(err.message, { status: err.status })
      }

      return new Response('Internal server error', { status: 500 })
    },
  },
  async (): Promise<Response> => {
    const [data, err] = await db.findUnique({ id: 'liveblocks' })

    if (err) {
      throw new DbUnknownError(err.message, 500)
    }

    if (data === null) {
      throw new HttpError(404)
    }

    return Response.json({ data })
  }
)
```

## Fair use note

Please note that if you're not using any of the proposed options in `createSafeRouteHandler` it means you're surely don't need it.

```tsx
// Calling 👇🏻
export const GET = createSafeRouteHandler({}, async () => {
  return new Response(null, { status: 200 })
})

// is equal to declare the route handler this way 👇🏻
export function GET() {
  return new Response(null, { status: 200 })
}
// excepts `createSafeRouteHandler` will provide by default a native error catching
// and will return a `500` response. That's the only advantage.
```

Feel free to open an issue or a PR if you think a relevant option could be added into the factory 🙂

## Contributing

All contributions are welcome! 🙂 Feel free to open an issue if you find a bug or create a pull request if you have a feature request.

## Credits

- Thanks to [@t3-oss/env-core](https://github.com/t3-oss/t3-env) for opening the implementation of `StandardSchemaDictionary` 🙏🏻
- Thanks to [frimousse](https://github.com/liveblocks/frimousse) for opening the release & publish workflow 🙏🏻

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
