import {
  describe,
  test,
  expect,
  expectTypeOf,
  afterEach,
  beforeEach,
  vi,
} from 'vitest'
import React from 'react'
import { string, numeric, array } from 'decoders'
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
} from './errors'

describe('createSafePageServerComponent - default context', () => {
  test('provides default context', async () => {
    const Page = createSafePageServerComponent({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<{
        readonly id: string
      }>()
      expect(ctx.id).toBe(DEFAULT_PAGE_ID)

      return <div>Hello, world!</div>
    })

    const result = await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
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
      `🔄 Running page server component'${DEFAULT_PAGE_ID}'`
    )
  })

  test('should use custom id if provided', async () => {
    const id = 'custom-page-id'
    const Page = createSafePageServerComponent({ id }, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe('custom-page-id')
      return <div>Hello, world!</div>
    })

    await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running page server component'${id}'`
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
      }
    )

    const result = await Page({
      params: undefined,
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })

  test('should throw error for unauthorized requests', async () => {
    const unauthorizedError = new Error('Unauthorized')
    const Page = createSafePageServerComponent(
      {
        authorize: () => {
          throw unauthorizedError
        },
      },
      async () => {
        return <div>Hello, world!</div>
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow('Unauthorized')
  })

  test('authorize receives segments and searchParams when provided', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string },
        searchParams: { query: string },
        authorize: async ({ segments, searchParams }) => {
          expect(segments.id).toBe('test-id')
          expect(searchParams.query).toBe('test-query')
          return { authorized: true }
        },
      },
      async ({ auth }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          authorized: boolean
        }>()
        return <div>Authorized</div>
      }
    )

    const result = await Page({
      params: Promise.resolve({ id: 'test-id' }),
      searchParams: Promise.resolve({ query: 'test-query' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })
})

describe('createSafePageServerComponent - on error', () => {
  test('throws error by default for unexpected errors', async () => {
    const Page = createSafePageServerComponent(
      { id: 'error-page' },
      async () => {
        throw new Error('Unexpected error')
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
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
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
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
      { id: 'redirect-page', debug: true },
      async () => {
        throw redirectError
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('does not log notFound errors', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const Page = createSafePageServerComponent(
      { id: 'notfound-page', debug: true },
      async () => {
        throw notFoundError
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('does not log forbidden errors', async () => {
    const forbiddenError = new Error('NEXT_FORBIDDEN') as Error & {
      digest: string
    }
    forbiddenError.digest = 'NEXT_HTTP_ERROR_FALLBACK;403'

    const Page = createSafePageServerComponent(
      { id: 'forbidden-page', debug: true },
      async () => {
        throw forbiddenError
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('does not log unauthorized errors', async () => {
    const unauthorizedError = new Error('NEXT_UNAUTHORIZED') as Error & {
      digest: string
    }
    unauthorizedError.digest = 'NEXT_HTTP_ERROR_FALLBACK;401'

    const Page = createSafePageServerComponent(
      { id: 'unauthorized-page', debug: true },
      async () => {
        throw unauthorizedError
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('still logs regular errors', async () => {
    const regularError = new Error('Regular error')

    const Page = createSafePageServerComponent(
      { id: 'regular-error-page', debug: true },
      async () => {
        throw regularError
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow('Regular error')

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      regularError
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
      }
    )

    const result = await Page({
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
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
      }
    )

    const result = await Page({
      params: { id: 'test-id' },
      searchParams: undefined,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })

  test('throws ValidationError for invalid segments', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: Promise.resolve({ ppid: 'suzuka', page: 'unknown' }),
        searchParams: undefined,
      })
    ).rejects.toThrow(ValidationError)
  })

  test('throws custom error for invalid segments', async () => {
    const customError = new Error('Custom segments error')
    const Page = createSafePageServerComponent(
      {
        segments: { id: string, page: numeric },
        onSegmentsValidationError: () => {
          throw customError
        },
      },
      async (ctx) => {
        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: Promise.resolve({ ppid: 'suzuka', page: 'unknown' }),
        searchParams: undefined,
      })
    ).rejects.toThrow('Custom segments error')
  })

  test('throws NoSegmentsProvidedError for missing segments', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow(NoSegmentsProvidedError)
  })
})

describe('createSafePageServerComponent - URL search params validation', () => {
  test('validates search params correctly', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { query: string, page: numeric },
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
      }
    )

    const result = await Page({
      params: undefined,
      searchParams: Promise.resolve({ query: 'luke', page: '2' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
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
      }
    )

    const result = await Page({
      params: undefined,
      searchParams: { query: 'test-query' },
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
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
      }
    )

    const result = await Page({
      params: undefined,
      searchParams: Promise.resolve({ query: ['luke', 'anakin'] }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })

  test('throws ValidationError for invalid search params', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { query: string, page: numeric },
      },
      async ({ searchParams }) => {
        return (
          <div>
            {searchParams.query} - {searchParams.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: Promise.resolve({ q: 'luke', page: 'unknown' }),
      })
    ).rejects.toThrow(ValidationError)
  })

  test('throws custom error for invalid search params', async () => {
    const customError = new Error('Custom search params error')
    const Page = createSafePageServerComponent(
      {
        searchParams: { query: string, page: numeric },
        onSearchParamsValidationError: () => {
          throw customError
        },
      },
      async ({ searchParams }) => {
        return (
          <div>
            {searchParams.query} - {searchParams.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: Promise.resolve({ q: 'luke', page: 'unknown' }),
      })
    ).rejects.toThrow('Custom search params error')
  })

  test('throws NoSearchParamsProvidedError for missing search params', async () => {
    const Page = createSafePageServerComponent(
      {
        searchParams: { query: string },
      },
      async ({ searchParams }) => {
        return <div>{searchParams.query}</div>
      }
    )

    await expect(
      Page({
        params: undefined,
        searchParams: undefined,
      })
    ).rejects.toThrow(NoSearchParamsProvidedError)
  })
})

describe('createSafePageServerComponent - combined validations', () => {
  test('validates segments and search params correctly', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { accountId: string, projectId: string },
        searchParams: { query: string, page: numeric },
      },
      async ({ segments, searchParams }) => {
        return (
          <div>
            {segments.accountId}/{segments.projectId}?query={searchParams.query}
            &page={searchParams.page}
          </div>
        )
      }
    )

    const result = await Page({
      params: Promise.resolve({
        accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
        projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
      }),
      searchParams: Promise.resolve({ query: 'liveblocks', page: '2' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })

  test('throws error for invalid segments and valid search params', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { accountId: string, projectId: string },
        searchParams: { query: string, page: numeric },
      },
      async ({ segments, searchParams }) => {
        return (
          <div>
            {segments.accountId}/{segments.projectId}?query={searchParams.query}
            &page={searchParams.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: Promise.resolve({
          accid: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
          pjid: '141399a5-14c5-47aa-bc04-2a281380b6e3',
        }),
        searchParams: Promise.resolve({ query: 'liveblocks', page: '2' }),
      })
    ).rejects.toThrow(ValidationError)
  })

  test('throws error for valid segments and invalid search params', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { accountId: string, projectId: string },
        searchParams: { query: string, page: numeric },
      },
      async ({ segments, searchParams }) => {
        return (
          <div>
            {segments.accountId}/{segments.projectId}?query={searchParams.query}
            &page={searchParams.page}
          </div>
        )
      }
    )

    await expect(
      Page({
        params: Promise.resolve({
          accountId: '0e0378fd-808d-4e1c-8707-bb5c918c1ed2',
          projectId: '141399a5-14c5-47aa-bc04-2a281380b6e3',
        }),
        searchParams: Promise.resolve({ q: 'liveblocks', page: '2' }),
      })
    ).rejects.toThrow(ValidationError)
  })
})

describe('createSafePageServerComponent - framework validation agnostic', () => {
  test('validates correctly with zod schemas', async () => {
    const Page = createSafePageServerComponent(
      {
        segments: { id: z.string() },
        searchParams: { query: z.string(), page: z.coerce.number() },
      },
      async ({ segments, searchParams }) => {
        return (
          <div>
            {segments.id}?query={searchParams.query}&page={searchParams.page}
          </div>
        )
      }
    )

    const result = await Page({
      params: Promise.resolve({ id: 'test-id' }),
      searchParams: Promise.resolve({ query: 'test', page: '42' }),
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })
})

describe('createSafeLayoutServerComponent - default context', () => {
  test('provides default context', async () => {
    const Layout = createSafeLayoutServerComponent({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<{
        readonly id: string
        readonly children: React.ReactNode
      }>()
      expect(ctx.id).toBe(DEFAULT_LAYOUT_ID)
      expect(ctx.children).toBeDefined()

      return <div>{ctx.children}</div>
    })

    const result = await Layout({
      params: undefined,
      children: <div>Children</div>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
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
      params: undefined,
      children: <div>Children</div>,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running layout server component'${DEFAULT_LAYOUT_ID}'`
    )
  })

  test('should use custom id if provided', async () => {
    const id = 'custom-layout-id'
    const Layout = createSafeLayoutServerComponent({ id }, async ({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string>()
      expect(id).toBe('custom-layout-id')
      return <div>Layout</div>
    })

    await Layout({
      params: undefined,
      children: <div>Children</div>,
    })

    expect(logSpy).toHaveBeenCalledWith(
      `🔄 Running layout server component'${id}'`
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
      }
    )

    const result = await Layout({
      params: undefined,
      children: <div>Children</div>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })

  test('should throw error for unauthorized requests', async () => {
    const unauthorizedError = new Error('Unauthorized')
    const Layout = createSafeLayoutServerComponent(
      {
        authorize: () => {
          throw unauthorizedError
        },
      },
      async ({ children }) => {
        return <div>{children}</div>
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow('Unauthorized')
  })

  test('authorize receives segments when provided', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string },
        authorize: async ({ segments }) => {
          expect(segments.id).toBe('test-id')
          return { authorized: true }
        },
      },
      async ({ auth, children }) => {
        expectTypeOf(auth).toEqualTypeOf<{
          authorized: boolean
        }>()
        return <div>{children}</div>
      }
    )

    const result = await Layout({
      params: Promise.resolve({ id: 'test-id' }),
      children: <div>Children</div>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })
})

describe('createSafeLayoutServerComponent - on error', () => {
  test('throws error by default for unexpected errors', async () => {
    const Layout = createSafeLayoutServerComponent(
      { id: 'error-layout' },
      async () => {
        throw new Error('Unexpected error')
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
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
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
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
      { id: 'redirect-layout', debug: true },
      async () => {
        throw redirectError
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('does not log notFound errors', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const Layout = createSafeLayoutServerComponent(
      { id: 'notfound-layout', debug: true },
      async () => {
        throw notFoundError
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('does not log forbidden errors', async () => {
    const forbiddenError = new Error('NEXT_FORBIDDEN') as Error & {
      digest: string
    }
    forbiddenError.digest = 'NEXT_HTTP_ERROR_FALLBACK;403'

    const Layout = createSafeLayoutServerComponent(
      { id: 'forbidden-layout', debug: true },
      async () => {
        throw forbiddenError
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('does not log unauthorized errors', async () => {
    const unauthorizedError = new Error('NEXT_UNAUTHORIZED') as Error & {
      digest: string
    }
    unauthorizedError.digest = 'NEXT_HTTP_ERROR_FALLBACK;401'

    const Layout = createSafeLayoutServerComponent(
      { id: 'unauthorized-layout', debug: true },
      async () => {
        throw unauthorizedError
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow()

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('still logs regular errors', async () => {
    const regularError = new Error('Regular error')

    const Layout = createSafeLayoutServerComponent(
      { id: 'regular-error-layout', debug: true },
      async () => {
        throw regularError
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow('Regular error')

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      regularError
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
      }
    )

    const result = await Layout({
      params: Promise.resolve({ id: 'suzuka', page: '256' }),
      children: <div>Children</div>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
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
      }
    )

    const result = await Layout({
      params: { id: 'test-id' },
      children: <div>Children</div>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })

  test('throws ValidationError for invalid segments', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
            {ctx.children}
          </div>
        )
      }
    )

    await expect(
      Layout({
        params: Promise.resolve({ ppid: 'suzuka', page: 'unknown' }),
        children: <div>Children</div>,
      })
    ).rejects.toThrow(ValidationError)
  })

  test('throws custom error for invalid segments', async () => {
    const customError = new Error('Custom segments error')
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string, page: numeric },
        onSegmentsValidationError: () => {
          throw customError
        },
      },
      async (ctx) => {
        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
            {ctx.children}
          </div>
        )
      }
    )

    await expect(
      Layout({
        params: Promise.resolve({ ppid: 'suzuka', page: 'unknown' }),
        children: <div>Children</div>,
      })
    ).rejects.toThrow('Custom segments error')
  })

  test('throws NoSegmentsProvidedError for missing segments', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: string, page: numeric },
      },
      async (ctx) => {
        return (
          <div>
            {ctx.segments.id} - {ctx.segments.page}
            {ctx.children}
          </div>
        )
      }
    )

    await expect(
      Layout({
        params: undefined,
        children: <div>Children</div>,
      })
    ).rejects.toThrow(NoSegmentsProvidedError)
  })
})

describe('createSafeLayoutServerComponent - children handling', () => {
  test('passes children correctly', async () => {
    const Layout = createSafeLayoutServerComponent({}, async ({ children }) => {
      return (
        <div>
          <header>Header</header>
          {children}
          <footer>Footer</footer>
        </div>
      )
    })

    const children = <main>Content</main>
    const result = await Layout({
      params: undefined,
      children,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })
})

describe('createSafeLayoutServerComponent - framework validation agnostic', () => {
  test('validates correctly with zod schemas', async () => {
    const Layout = createSafeLayoutServerComponent(
      {
        segments: { id: z.string() },
      },
      async ({ segments, children }) => {
        return (
          <div>
            {segments.id}
            {children}
          </div>
        )
      }
    )

    const result = await Layout({
      params: Promise.resolve({ id: 'test-id' }),
      children: <div>Children</div>,
    })

    expect(result).toBeDefined()
    expect(React.isValidElement(result)).toBe(true)
  })
})
