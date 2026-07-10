import { string, numeric, array } from 'decoders'
import React from 'react'
import {
  describe,
  test,
  expect,
  expectTypeOf,
  afterEach,
  beforeEach,
  vi,
} from 'vitest'
import { z } from 'zod'

import {
  DEFAULT_PAGE_ID,
  DEFAULT_LAYOUT_ID,
  createSafePageServerComponent,
  createSafeLayoutServerComponent,
} from './create-safe-server-component'
import {
  ValidationError,
  NoSegmentsProvidedError,
  NoSearchParamsProvidedError,
  MissingLayoutSlotsError,
} from './errors'

type DefaultPageContext = {
  readonly id: string
}

type DefaultLayoutContext = {
  readonly id: string
  readonly children: React.ReactNode
}

describe('createSafePageServerComponent - default context', () => {
  test('provides default context', async () => {
    const Page = createSafePageServerComponent({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<DefaultPageContext>()
      expect(ctx.id).toBe(DEFAULT_PAGE_ID)

      return <div>Hello, world!</div>
    })

    const result = await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafePageServerComponent - id customization', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  test('should use default id if not provided', async () => {
    const Page = createSafePageServerComponent({}, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe(DEFAULT_PAGE_ID)
      return <div>Hello, world!</div>
    })

    await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running page server component'${DEFAULT_PAGE_ID}'`,
    )
  })

  test('should use custom id if provided', async () => {
    const pageId = 'custom-page-id'
    const Page = createSafePageServerComponent(
      { id: pageId },
      async ({ id }) => {
        expectTypeOf(id).toEqualTypeOf<string>()
        expect(id).toBe('custom-page-id')
        return <div>Hello, world!</div>
      },
    )

    await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running page server component'${pageId}'`,
    )
  })
})

describe('createSafePageServerComponent - authorize', () => {
  test('should authorize the request and return auth context', async () => {
    const user = {
      id: 'ccd5cf55-de71-482b-bfee-ad450dbcd20e',
      name: 'Rocky Balboa',
    }

    const Page = createSafePageServerComponent(
      {
        authorize: () => ({ user }),
      },
      async ({ auth }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          user: {
            id: string
            name: string
          }
        }>()
        expect(auth.user.id).toBe(user.id)
        expect(auth.user.name).toBe(user.name)

        return <div>{auth.user.name}</div>
      },
    )

    const result = await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('should throw error for unauthorized requests', async () => {
    const unauthorizedError = new Error('Unauthorized')
    const Page = createSafePageServerComponent(
      {
        authorize: () => {
          throw unauthorizedError
        },
      },
      async () => <div>Hello, world!</div>,
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('Unauthorized')
  })

  test('authorize receives segments and searchParams when provided', async () => {
    const Page = createSafePageServerComponent(
      {
        authorize: async ({ segments, searchParams }) => {
          expect(segments.id).toBe('test-id')
          expect(searchParams.query).toBe('test-query')
          return { authorized: true }
        },
        searchParams: { query: string },
        segments: { id: string },
      },
      async ({ auth }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          authorized: boolean
        }>()
        return <div>Authorized</div>
      },
    )

    const result = await Page({
      params: Promise.resolve({ id: 'test-id' }),
      searchParams: Promise.resolve({ query: 'test-query' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafePageServerComponent - on error', () => {
  test('throws error by default for unexpected errors', async () => {
    const Page = createSafePageServerComponent(
      { id: 'error-page' },
      async () => {
        throw new Error('Unexpected error')
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('Unexpected error')
  })

  test('throws custom error for unexpected errors', async () => {
    const customError = new Error('Custom error')
    const Page = createSafePageServerComponent(
      {
        onError: () => {
          throw customError
        },
      },
      async () => {
        throw new Error('Unexpected error')
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('Custom error')
  })
})

describe('createSafePageServerComponent - Next.js native errors logging', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  test('does not log redirect errors', async () => {
    const redirectError = new Error('NEXT_REDIRECT') as Error & {
      digest: string
    }
    redirectError.digest = 'NEXT_REDIRECT;replace;/redirect-path;307;'

    const Page = createSafePageServerComponent(
      { debug: true, id: 'redirect-page' },
      async () => {
        throw redirectError
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log notFound errors', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const Page = createSafePageServerComponent(
      { debug: true, id: 'notfound-page' },
      async () => {
        throw notFoundError
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log forbidden errors', async () => {
    const forbiddenError = new Error('NEXT_FORBIDDEN') as Error & {
      digest: string
    }
    forbiddenError.digest = 'NEXT_HTTP_ERROR_FALLBACK;403'

    const Page = createSafePageServerComponent(
      { debug: true, id: 'forbidden-page' },
      async () => {
        throw forbiddenError
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('NEXT_FORBIDDEN')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log unauthorized errors', async () => {
    const unauthorizedError = new Error('NEXT_UNAUTHORIZED') as Error & {
      digest: string
    }
    unauthorizedError.digest = 'NEXT_HTTP_ERROR_FALLBACK;401'

    const Page = createSafePageServerComponent(
      { debug: true, id: 'unauthorized-page' },
      async () => {
        throw unauthorizedError
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('NEXT_UNAUTHORIZED')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('still logs regular errors', async () => {
    const regularError = new Error('Regular error')

    const Page = createSafePageServerComponent(
      { debug: true, id: 'regular-error-page' },
      async () => {
        throw regularError
      },
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow('Regular error')

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(`🛑 Page server component 'regular-error-page'`),
    )
  })
})

describe('createSafePageServerComponent - route dynamic segments validation', () => {
  test('validates segments correctly', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        expectTypeOf(ctx.segments).toEqualTypeOf<{
          id: string
          page: number
        }>()

        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
          </div>
        )
      },
    )

    const result = await Page({
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('validates segments correctly with non-promise params', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string },
      },
      async (ctx) => {
        expectTypeOf(ctx.segments).toEqualTypeOf<{
          id: string
        }>()

        return <div>{ctx.segments.id}</div>
      },
    )

    const result = await Page({
      params: { id: 'test-id' },
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('throws ValidationError for invalid segments', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => (
        <div>
          {ctx.segments.id} - {ctx.segments.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: Promise.resolve({ page: 'unknown', ppid: 'suzuka' }),
        searchParams: undefined,
      }),
    ).rejects.toThrow(ValidationError)
  })

  test('throws custom error for invalid segments', async () => {
    const customError = new Error('Custom segments error')
    const Page = createSafePageServerComponent(
      {
        onSegmentsValidationError: () => {
          throw customError
        },
        segments: { id: string, page: numeric },
      },
      async (ctx) => (
        <div>
          {ctx.segments.id} - {ctx.segments.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: Promise.resolve({ page: 'unknown', ppid: 'suzuka' }),
        searchParams: undefined,
      }),
    ).rejects.toThrow('Custom segments error')
  })

  test('throws NoSegmentsProvidedError for missing segments', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => (
        <div>
          {ctx.segments.id} - {ctx.segments.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow(NoSegmentsProvidedError)
  })
})

describe('createSafePageServerComponent - URL search params validation', () => {
  test('validates search params correctly', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { page: numeric, query: string },
      },
      async ({ searchParams }) => {
        expectTypeOf(searchParams).toEqualTypeOf<{
          query: string
          page: number
        }>()

        return (
          <div>
            {searchParams.query} - {searchParams.page}
          </div>
        )
      },
    )

    const result = await Page({
      params: undefined,
      searchParams: Promise.resolve({ page: '2', query: 'luke' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('validates search params correctly with non-promise searchParams', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { query: string },
      },
      async ({ searchParams }) => {
        expectTypeOf(searchParams).toEqualTypeOf<{
          query: string
        }>()

        return <div>{searchParams.query}</div>
      },
    )

    const result = await Page({
      params: undefined,
      searchParams: { query: 'test-query' },
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('validates search params correctly with arrays', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: {
          query: array(string),
        },
      },
      async ({ searchParams }) => {
        expectTypeOf(searchParams).toEqualTypeOf<{
          query: string[]
        }>()

        return <div>{searchParams.query.join(', ')}</div>
      },
    )

    const result = await Page({
      params: undefined,
      searchParams: Promise.resolve({ query: ['luke', 'anakin'] }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('throws ValidationError for invalid search params', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { page: numeric, query: string },
      },
      async ({ searchParams }) => (
        <div>
          {searchParams.query} - {searchParams.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: undefined,
        searchParams: Promise.resolve({ page: 'unknown', q: 'luke' }),
      }),
    ).rejects.toThrow(ValidationError)
  })

  test('throws custom error for invalid search params', async () => {
    const customError = new Error('Custom search params error')
    const Page = createSafePageServerComponent(
      {
        onSearchParamsValidationError: () => {
          throw customError
        },
        searchParams: { page: numeric, query: string },
      },
      async ({ searchParams }) => (
        <div>
          {searchParams.query} - {searchParams.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: undefined,
        searchParams: Promise.resolve({ page: 'unknown', q: 'luke' }),
      }),
    ).rejects.toThrow('Custom search params error')
  })

  test('throws NoSearchParamsProvidedError for missing search params', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { query: string },
      },
      async ({ searchParams }) => <div>{searchParams.query}</div>,
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      }),
    ).rejects.toThrow(NoSearchParamsProvidedError)
  })
})

describe('createSafePageServerComponent - combined validations', () => {
  test('validates segments and search params correctly', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, searchParams }) => (
        <div>
          {segments.accountId}/{segments.projectId}?query={searchParams.query}
          &page={searchParams.page}
        </div>
      ),
    )

    const result = await Page({
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
      searchParams: Promise.resolve({ page: '2', query: 'liveblocks' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('throws error for invalid segments and valid search params', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, searchParams }) => (
        <div>
          {segments.accountId}/{segments.projectId}?query={searchParams.query}
          &page={searchParams.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: Promise.resolve({
          accid: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
          pjid: '141399a5-14c5-47aa-bc04-2a281380b6e3',
        }),
        searchParams: Promise.resolve({ page: '2', query: 'liveblocks' }),
      }),
    ).rejects.toThrow(ValidationError)
  })

  test('throws error for valid segments and invalid search params', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { page: numeric, query: string },
        segments: { accountId: string, projectId: string },
      },
      async ({ segments, searchParams }) => (
        <div>
          {segments.accountId}/{segments.projectId}?query={searchParams.query}
          &page={searchParams.page}
        </div>
      ),
    )

    await expect(
      Page({
        params: Promise.resolve({
          accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
          projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
        }),
        searchParams: Promise.resolve({ page: '2', q: 'liveblocks' }),
      }),
    ).rejects.toThrow(ValidationError)
  })
})

describe('createSafePageServerComponent - framework validation agnostic', () => {
  test('validates correctly with zod schemas', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { page: z.coerce.number(), query: z.string() },
        segments: { id: z.string() },
      },
      async ({ segments, searchParams }) => (
        <div>
          {segments.id}?query={searchParams.query}&page={searchParams.page}
        </div>
      ),
    )

    const result = await Page({
      params: Promise.resolve({ id: 'test-id' }),
      searchParams: Promise.resolve({ page: '42', query: 'test' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafeLayoutServerComponent - default context', () => {
  test('provides default context', async () => {
    const Layout = createSafeLayoutServerComponent({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<DefaultLayoutContext>()
      expect(ctx.id).toBe(DEFAULT_LAYOUT_ID)
      expect(ctx.children).toBeDefined()

      return <div>{ctx.children}</div>
    })

    const result = await Layout({
      children: <div>Children</div>,
      params: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafeLayoutServerComponent - id customization', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  test('should use default id if not provided', async () => {
    const Layout = createSafeLayoutServerComponent({}, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe(DEFAULT_LAYOUT_ID)
      return <div>Layout</div>
    })

    await Layout({
      children: <div>Children</div>,
      params: undefined,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running layout server component'${DEFAULT_LAYOUT_ID}'`,
    )
  })

  test('should use custom id if provided', async () => {
    const layoutId = 'custom-layout-id'
    const Layout = createSafeLayoutServerComponent(
      { id: layoutId },
      async ({ id }) => {
        expectTypeOf(id).toEqualTypeOf<string>()
        expect(id).toBe('custom-layout-id')
        return <div>Layout</div>
      },
    )

    await Layout({
      children: <div>Children</div>,
      params: undefined,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running layout server component'${layoutId}'`,
    )
  })
})

describe('createSafeLayoutServerComponent - authorize', () => {
  test('should authorize the request and return auth context', async () => {
    const user = {
      id: 'ccd5cf55-de71-482b-bfee-ad450dbcd20e',
      name: 'Rocky Balboa',
    }

    const Layout = createSafeLayoutServerComponent(
      {
        authorize: () => ({ user }),
      },
      async ({ auth, children }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          user: {
            id: string
            name: string
          }
        }>()
        expect(auth.user.id).toBe(user.id)
        expect(auth.user.name).toBe(user.name)

        return (
          <div>
            <div>{auth.user.name}</div>
            {children}
          </div>
        )
      },
    )

    const result = await Layout({
      children: <div>Children</div>,
      params: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('should throw error for unauthorized requests', async () => {
    const unauthorizedError = new Error('Unauthorized')
    const Layout = createSafeLayoutServerComponent(
      {
        authorize: () => {
          throw unauthorizedError
        },
      },
      async ({ children }) => <div>{children}</div>,
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('Unauthorized')
  })

  test('authorize receives segments when provided', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        authorize: async ({ segments }) => {
          expect(segments.id).toBe('test-id')
          return { authorized: true }
        },
        segments: { id: string },
      },
      async ({ auth, children }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          authorized: boolean
        }>()
        return <div>{children}</div>
      },
    )

    const result = await Layout({
      children: <div>Children</div>,
      params: Promise.resolve({ id: 'test-id' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafeLayoutServerComponent - on error', () => {
  test('throws error by default for unexpected errors', async () => {
    const Layout = createSafeLayoutServerComponent(
      { id: 'error-layout' },
      async () => {
        throw new Error('Unexpected error')
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('Unexpected error')
  })

  test('throws custom error for unexpected errors', async () => {
    const customError = new Error('Custom error')
    const Layout = createSafeLayoutServerComponent(
      {
        onError: () => {
          throw customError
        },
      },
      async () => {
        throw new Error('Unexpected error')
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('Custom error')
  })
})

describe('createSafeLayoutServerComponent - Next.js native errors logging', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  test('does not log redirect errors', async () => {
    const redirectError = new Error('NEXT_REDIRECT') as Error & {
      digest: string
    }
    redirectError.digest = 'NEXT_REDIRECT;replace;/redirect-path;307;'

    const Layout = createSafeLayoutServerComponent(
      { debug: true, id: 'redirect-layout' },
      async () => {
        throw redirectError
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log notFound errors', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const Layout = createSafeLayoutServerComponent(
      { debug: true, id: 'notfound-layout' },
      async () => {
        throw notFoundError
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log forbidden errors', async () => {
    const forbiddenError = new Error('NEXT_FORBIDDEN') as Error & {
      digest: string
    }
    forbiddenError.digest = 'NEXT_HTTP_ERROR_FALLBACK;403'

    const Layout = createSafeLayoutServerComponent(
      { debug: true, id: 'forbidden-layout' },
      async () => {
        throw forbiddenError
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('NEXT_FORBIDDEN')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('does not log unauthorized errors', async () => {
    const unauthorizedError = new Error('NEXT_UNAUTHORIZED') as Error & {
      digest: string
    }
    unauthorizedError.digest = 'NEXT_HTTP_ERROR_FALLBACK;401'

    const Layout = createSafeLayoutServerComponent(
      { debug: true, id: 'unauthorized-layout' },
      async () => {
        throw unauthorizedError
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('NEXT_UNAUTHORIZED')

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything(),
    )
  })

  test('still logs regular errors', async () => {
    const regularError = new Error('Regular error')

    const Layout = createSafeLayoutServerComponent(
      { debug: true, id: 'regular-error-layout' },
      async () => {
        throw regularError
      },
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow('Regular error')

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `🛑 Layout server component 'regular-error-layout'`,
      ),
    )
  })
})

describe('createSafeLayoutServerComponent - route dynamic segments validation', () => {
  test('validates segments correctly', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        expectTypeOf(ctx.segments).toEqualTypeOf<{
          id: string
          page: number
        }>()

        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
            {ctx.children}
          </div>
        )
      },
    )

    const result = await Layout({
      children: <div>Children</div>,
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('validates segments correctly with non-promise params', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string },
      },
      async (ctx) => {
        expectTypeOf(ctx.segments).toEqualTypeOf<{
          id: string
        }>()

        return (
          <div>
            {ctx.segments.id}
            {ctx.children}
          </div>
        )
      },
    )

    const result = await Layout({
      children: <div>Children</div>,
      params: { id: 'test-id' },
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('throws ValidationError for invalid segments', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => (
        <div>
          {ctx.segments.id} - {ctx.segments.page}
          {ctx.children}
        </div>
      ),
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: Promise.resolve({ page: 'unknown', ppid: 'suzuka' }),
      }),
    ).rejects.toThrow(ValidationError)
  })

  test('throws custom error for invalid segments', async () => {
    const customError = new Error('Custom segments error')
    const Layout = createSafeLayoutServerComponent(
      {
        onSegmentsValidationError: () => {
          throw customError
        },
        segments: { id: string, page: numeric },
      },
      async (ctx) => (
        <div>
          {ctx.segments.id} - {ctx.segments.page}
          {ctx.children}
        </div>
      ),
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: Promise.resolve({ page: 'unknown', ppid: 'suzuka' }),
      }),
    ).rejects.toThrow('Custom segments error')
  })

  test('throws NoSegmentsProvidedError for missing segments', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => (
        <div>
          {ctx.segments.id} - {ctx.segments.page}
          {ctx.children}
        </div>
      ),
    )

    await expect(
      Layout({
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow(NoSegmentsProvidedError)
  })
})

describe('createSafeLayoutServerComponent - children handling', () => {
  test('passes children correctly', async () => {
    const Layout = createSafeLayoutServerComponent({}, async ({ children }) => (
      <div>
        <header>Header</header>
        {children}
        <footer>Footer</footer>
      </div>
    ))

    const children = <main>Content</main>
    const result = await Layout({
      children,
      params: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafeLayoutServerComponent - framework validation agnostic', () => {
  test('validates correctly with zod schemas', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: z.string() },
      },
      async ({ segments, children }) => (
        <div>
          {segments.id}
          {children}
        </div>
      ),
    )

    const result = await Layout({
      children: <div>Children</div>,
      params: Promise.resolve({ id: 'test-id' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})

describe('createSafeLayoutServerComponent - experimental slots', () => {
  test('provides slots in context when `experimental_slots` is defined', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: ['analytics', 'teams'] as const,
      },
      async ({ experimental_slots, children }) => {
        expectTypeOf(experimental_slots).toEqualTypeOf<{
          analytics: React.ReactNode
          teams: React.ReactNode
        }>()
        expect(experimental_slots).toBeDefined()
        expect(experimental_slots.analytics).toBeDefined()
        expect(experimental_slots.teams).toBeDefined()

        return (
          <div>
            {experimental_slots.teams}
            {children}
            {experimental_slots.analytics}
          </div>
        )
      },
    )

    const result = await Layout({
      analytics: <div>analytics</div>,
      children: <div>children</div>,
      params: undefined,
      teams: <header>teams</header>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('infer slots type correctly', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: ['analytics', 'teams'] as const,
      },
      async ({ experimental_slots }) => {
        expectTypeOf(experimental_slots).toEqualTypeOf<{
          analytics: React.ReactNode
          teams: React.ReactNode
        }>()
        return (
          <div>
            {experimental_slots.analytics}
            {experimental_slots.teams}
          </div>
        )
      },
    )

    const result = await Layout({
      analytics: <aside>analytics</aside>,
      children: <div>children</div>,
      params: undefined,
      teams: <footer>teams</footer>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('throws `MissingLayoutSlotsError` when expected slots are missing', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: ['analytics', 'header'] as const,
        id: 'missing-slots-layout',
      },
      async ({ experimental_slots, children }) => (
        <div>
          {experimental_slots.header}
          {children}
          {experimental_slots.analytics}
        </div>
      ),
    )

    await expect(
      // @ts-expect-error - We are testing the error case.
      Layout({
        children: <div>children</div>,
        params: undefined,
      }),
    ).rejects.toThrow(MissingLayoutSlotsError)
  })

  test('throws `MissingLayoutSlotsError` with correct message for missing slots', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: ['analytics', 'header', 'footer'] as const,
        id: 'test-layout',
      },
      async ({ experimental_slots, children }) => (
        <div>
          {experimental_slots.header}
          {children}
          {experimental_slots.analytics}
          {experimental_slots.footer}
        </div>
      ),
    )

    await expect(
      // @ts-expect-error - We are testing the error case.
      Layout({
        children: <div>children</div>,
        params: undefined,
      }),
    ).rejects.toThrow(
      "Missing slots ['analytics', 'header', 'footer'] for layout server component 'test-layout'",
    )
  })

  test('throws `MissingLayoutSlotsError` when only some slots are missing', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: ['analytics', 'header', 'footer'] as const,
        id: 'partial-slots-layout',
      },
      async ({ experimental_slots, children }) => (
        <div>
          {experimental_slots.header}
          {children}
          {experimental_slots.analytics}
          {experimental_slots.footer}
        </div>
      ),
    )

    await expect(
      // @ts-expect-error - We are testing the error case.
      Layout({
        analytics: <div>Analytics</div>,
        children: <div>Children</div>,
        params: undefined,
      }),
    ).rejects.toThrow(MissingLayoutSlotsError)
  })

  test('allows to use a single slot', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: ['analytics'] as const,
      },
      async ({ experimental_slots, children }) => {
        expectTypeOf(experimental_slots).toEqualTypeOf<{
          analytics: React.ReactNode
        }>()
        return (
          <div>
            {experimental_slots.analytics}
            {children}
          </div>
        )
      },
    )

    const result = await Layout({
      analytics: <aside>analytics</aside>,
      children: <div>children</div>,
      params: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('does not include slots in context when `experimental_slots` is not defined', async () => {
    const Layout = createSafeLayoutServerComponent({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<DefaultLayoutContext>()
      expect('experimental_slots' in ctx).toBeFalsy()

      return <div>{ctx.children}</div>
    })

    const result = await Layout({
      children: <div>Children</div>,
      params: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })

  test('does not include slots in context when `experimental_slots` is an empty array', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        experimental_slots: [] as const,
      },
      async ({ experimental_slots, children }) => {
        // oxlint-disable-next-line @typescript-eslint/no-empty-object-type typescript/ban-types
        expectTypeOf(experimental_slots).toEqualTypeOf<{}>()
        expect(experimental_slots).toStrictEqual({})
        return <div>{children}</div>
      },
    )

    const result = await Layout({
      children: <div>Children</div>,
      params: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBeTruthy()
  })
})
