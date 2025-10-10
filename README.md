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
import { object, string, number } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'
import { auth } from '~/lib/auth'

export const POST = createSafeRouteHandler(
  {
    authorize: async ({ req }) => {
      const session = await auth.getSession(req)
      if (!session) {
        return new Response(null, { status: 401 })
      }

      return { user: session.user }
    },
    body: object({
      foo: string,
      bar: number,
    }),
  },
  async ({ auth, body }, req): Promise<Response> => {
    return Response.json({ user: auth.user, body }, { status: 200 })
  }
)
```

The example above shows how to use the factory to authorize your requests.

## Framework validation agnostic

By design the factory is framework validation agnostic 🌟. When doing your validations you can use whatever you want as framework validation as long as it implements the [Standard Schema](https://github.com/standard-schema/standard-schema) common interface. You can use your favorite validation library like [Zod](https://zod.dev/), [Validbot](https://valibot.dev/) or [decoders](https://decoders.cc/).

```tsx
// (POST) /app/api/races/[id]/route.ts
import { z } from 'zod'
import { object, string, number } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

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
  async ({ segments, body }) => {
    return Response.json({ segments, body })
  }
)
```

## Synchronous validations

The factory do not supports async validations. As required by the [Standard Schema](https://github.com/standard-schema/standard-schema) common interface we should avoid it. In the context of a route handler it's not necessary.

If you define an async validation then the route handler will throw an error.

## API

Check the API and the available options to configure the factory as you wish.

### Function signature

```tsx
import {
  type CreateSafeRouteHandlerOptions,
  type SafeRouteHandlerContext,
  createSafeRouteHandler
} from '@sugardarius/anzen'

/**
 * Returns a Next.js API route handler function.
 */
export const VERB = createSafeRouteHandler(
  /**
   * Options to configure the route handler
   */
  options: CreateSafeRouteHandlerOptions,
  /**
   * The route handler function.
   */
  async (
    /**
     * Context object providing:
     *  auth context
     *  validated segments, search params, body and form data
     */
    ctx: SafeRouteHandlerContext,
    /**
     * Original request
     */
    req: Request
): Promise<Response> => Response.json({}))
```

### Using `NextRequest` type

By default the factory uses the native `Request` type. If you want to use the `NextRequest` type from [Next.js](https://nextjs.org/), you can do it by just using the `NextRequest` type in the factory handler.

```tsx
import { NextRequest } from 'next/server'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    id: 'next/request',
    authorize: async ({
      // Due to `NextRequest` limitations as the req is cloned it's always a `Request`
      req,
    }) => {
      console.log(req)
      return { user: 'John Doe' }
    },
  },
  async (ctx, req: NextRequest) => {
    console.log('pathname', req.nextUrl.pathname)
    return new Response(null, 200)
  }
)
```

### Base options

When creating a safe route handler you can use a bunch of options for helping you achieve different tasks 👇🏻

#### `id?: string`

Used for logging in development or when the `debug` option is enabled. You can also use it to add extra logging or monitoring.
By default the id is set to `[unknown:route:handler]`

```tsx
export const POST = createSafeRouteHandler(
  {
    id: 'auth/login',
  },
  async ({ id }) => {
    return Response.json({ id })
  }
)
```

#### `authorize?: AuthFunction<AC>`

Function to use to authorize the request. By default it always authorize the request.

Returns a response when the request is not authorized.

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'
import { auth } from '~/lib/auth'

export const GET = createSafeRouteHandler(
  {
    authorize: async ({ req, url }) => {
      console.log('url', url)
      const session = await auth.getSession(req)
      if (!session) {
        return new Response(null, { status: 401 })
      }

      return { user: session.user }
    },
  },
  async ({ auth, body }, req): Promise<Response> => {
    return Response.json({ user: auth.user }, { status: 200 })
  }
)
```

The original is cloned from the incoming request to avoid side effects and to make it consumable in the `authorize` function.

#### `onErrorResponse?: (err: unknown) => Awaitable<Response>`

Callback triggered when the request fails.
By default it returns a simple `500` response and the error is logged into the console.

Use it if your handler use custom errors and you want to manage them properly by returning a proper response.

You can read more about it under the [Error handling](#error-handling) section.

#### `debug?: boolean`

Use this options to enable debug mode. It will add logs in the handler to help you debug the request.

By default it's set to `false` for production builds.
In development builds, it will be `true` if `NODE_ENV` is not set to `production`.

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler({ debug: true }, async () => {
  return new Response(null, { status: 200 })
})
```

### Route handler options

You can configure route handler options to validation using a validation library dynamic route segments, URL query parameters, request json body or request form data body 👇🏻

#### `segments?: TSegments`

[Dynamic route segments](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments) used for the route handler path. By design it will handle if the segments are a `Promise` or not.

Please note the expected input is a `StandardSchemaDictionary`.

```tsx
import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    segments: {
      accountId: z.string(),
      projectId: z.string().optional(),
    },
  },
  async ({ segments }) => {
    return Response.json({ segments })
  }
)
```

#### `onSegmentsValidationErrorResponse?: OnValidationErrorResponse`

Callback triggered when dynamic segments validations returned issues. By default it returns a simple `400` response and issues are logged into the console.

```tsx
import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    segments: {
      accountId: z.string(),
      projectId: z.string().optional(),
    },
    onSegmentsValidationErrorResponse: (issues) => {
      return Response.json({ issues }, { status: 400 })
    },
  },
  async ({ segments }) => {
    return Response.json({ segments })
  }
)
```

#### `searchParams?: TSearchParams`

Search params used in the route.

Please note the expected input is a `StandardSchemaDictionary`.

```tsx
import { string, numeric, optional } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    searchParams: {
      query: string,
      page: optional(numeric),
    },
  },
  async ({ searchParams }) => {
    return Response.json({ searchParams })
  }
)
```

#### `onSearchParamsValidationErrorResponse?: OnValidationErrorResponse`

Callback triggered when search params validations returned issues. By default it returns a simple `400` response and issues are logged into the console.

```tsx
import { string, numeric, optional } from 'decoders'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler(
  {
    searchParams: {
      query: string,
      page: optional(numeric),
    },
    onSearchParamsValidationErrorResponse: (issues) => {
      return Response.json({ issues }, { status: 400 })
    },
  },
  async ({ searchParams }) => {
    return Response.json({ searchParams })
  }
)
```

#### `body?: TBody`

Request body.

Returns a `405` response if the request method is not `POST`, `PUT` or `PATCH`.

Returns a `415`response if the request does not explicitly set the `Content-Type` to `application/json`.

Please note the body is parsed as JSON, so it must be a valid JSON object. Body shouldn't be used with `formData` at the same time. They are **exclusive**.

Why making the distinction? `formData` is used as a `StandardSchemaDictionary` whereas `body` is used as a `StandardSchemaV1`.

```tsx
import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    body: z.object({
      name: z.string(),
      model: z.string(),
      apiKey: z.string(),
    }),
  },
  async ({ body }) => {
    return Response.json({ body })
  }
)
```

> When validating the body the request is cloned to let you consume the body in the original request (e.g second arguments of handler function).

#### `onBodyValidationErrorResponse?: OnValidationErrorResponse`

Callback triggered when body validation returned issues. By default it returns a simple `400` response and issues are logged into the console.

```tsx
import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    body: z.object({
      name: z.string(),
      model: z.string(),
      apiKey: z.string(),
    }),
    onBodyValidationErrorResponse: (issues) => {
      return Response.json({ issues }, { status: 400 })
    },
  },
  async ({ body }) => {
    return Response.json({ body })
  }
)
```

#### `formData?: TFormData`

Request form data.

Returns a `405` response if the request method is not `POST`, `PUT` or `PATCH`.

Returns a `415`response if the request does not explicitly set the `Content-Type` to `multipart/form-data` or to `application/x-www-form-urlencoded`.

Please note formData shouldn't be used with `body` at the same time. They are **exclusive**.

Why making the distinction? `formData` is used as a `StandardSchemaDictionary` whereas `body` is used as a `StandardSchemaV1`.

```tsx
import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    formData: {
      id: z.string(),
      message: z.string(),
    },
  },
  async ({ formData }) => {
    return Response.json({ formData })
  }
)
```

> When validating the form data the request is cloned to let you consume the form data in the original request (e.g second arguments of handler function).

#### `onFormDataValidationErrorResponse?: OnValidationErrorResponse`

Callback triggered when form data validation returned issues. By default it returns a simple `400` response and issues are logged into the console.

```tsx
import { z } from 'zod'
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const POST = createSafeRouteHandler(
  {
    formData: {
      id: z.string(),
      message: z.string(),
    },
    onFormDataValidationErrorResponse: (issues) => {
      return Response.json({ issues }, { status: 400 })
    },
  },
  async ({ formData }) => {
    return Response.json({ formData })
  }
)
```

### Error handling

By design the factory will catch any error thrown in the route handler will return a simple response with `500` status.

You can customize the error response if you want to fine tune error response management.

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'
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

### Using the request in the route handler

The original `request` is cascaded in the route handler function if you need to access to it.

```tsx
import { createSafeRouteHandler } from '@sugardarius/anzen'

export const GET = createSafeRouteHandler({}, async (ctx, req) => {
  console.log('integrity', req.integrity)
  return new Response(null, { status: 200 })
})
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

## Requirements

The factory `createSafeRouteHandler` requires Next.js `v14` or `v15` and typescript `v5` as peer dependencies.

## Contributing

All contributions are welcome! 🙂 Feel free to open an issue if you find a bug or create a pull request if you have a feature request.

## Credits

- Thanks to [@t3-oss/env-core](https://github.com/t3-oss/t3-env) for opening the implementation of `StandardSchemaDictionary` 🙏🏻
- Thanks to [frimousse](https://github.com/liveblocks/frimousse) for opening the release & publish workflow 🙏🏻

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
