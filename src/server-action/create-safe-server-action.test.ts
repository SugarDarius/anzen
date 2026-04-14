import {
  describe,
  test,
  expect,
  expectTypeOf,
  afterEach,
  beforeEach,
  vi,
} from 'vitest'
import { string, numeric, object } from 'decoders'
import { z } from 'zod'
import {
  createSafeServerAction,
  DEFAULT_ACTION_ID,
} from './create-safe-server-action'

describe('default context', () => {
  test('provides default context when no input schema', async () => {
    const action = createSafeServerAction({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<{
        readonly id: string
      }>()
      expect(ctx.id).toBe(DEFAULT_ACTION_ID)
      return { ok: true }
    })

    const result = await action()

    expect(result).toEqual({
      success: true,
      output: { ok: true },
    })
  })

  test('exposes DEFAULT_ACTION_ID for tests', () => {
    expect(DEFAULT_ACTION_ID).toBe('[unknown:server:action]')
  })
})

describe('id customization', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  test('uses default id in logs when id option is omitted', async () => {
    const action = createSafeServerAction({ debug: true }, async () => ({
      done: true,
    }))

    await action()

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Running server action '${DEFAULT_ACTION_ID}'`)
    )
  })

  test('uses custom id in logs when id option is set', async () => {
    const id = 'my-server-action'
    const action = createSafeServerAction({ id, debug: true }, async () => ({
      done: true,
    }))

    await action()

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Running server action '${id}'`)
    )
  })
})

describe('authorize', () => {
  test('passes auth context to the handler when authorize returns a value', async () => {
    const user = {
      id: 'ccd5cf55-de71-482b-bfee-ad450dbcd20e',
      name: 'Nimesh',
    }

    const action = createSafeServerAction(
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
        expect(auth.user).toEqual(user)
        return { greeting: auth.user.name }
      }
    )

    const result = await action()

    expect(result).toEqual({
      success: true,
      output: { greeting: 'Nimesh' },
    })
  })

  test('authorize receives id when there is no input schema', async () => {
    const action = createSafeServerAction(
      {
        id: 'auth-id-test',
        authorize: async (params) => {
          expectTypeOf(params).toEqualTypeOf<{ readonly id: string }>()
          expect(params.id).toBe('auth-id-test')
          return { role: 'admin' }
        },
      },
      async ({ auth }) => auth
    )

    const result = await action()
    expect(result).toEqual({
      success: true,
      output: { role: 'admin' },
    })
  })

  test('authorize receives id and validated input when input schema is set', async () => {
    const action = createSafeServerAction(
      {
        id: 'auth-with-input',
        input: z.object({
          resourceId: z.string(),
        }),
        authorize: async (params) => {
          expect(params.id).toBe('auth-with-input')
          expect(params.input.resourceId).toBe('res-1')
          return { ok: true as const }
        },
      },
      async ({ auth, input }) => ({ auth, input })
    )

    const result = await action({ resourceId: 'res-1' })
    expect(result).toEqual({
      success: true,
      output: {
        auth: { ok: true },
        input: { resourceId: 'res-1' },
      },
    })
  })

  test('returns UNAUTHORIZED when authorize throws a normal error', async () => {
    const err = new Error('Not allowed')
    const action = createSafeServerAction(
      {
        id: 'unauth-action',
        authorize: () => {
          throw err
        },
      },
      async () => ({})
    )

    const result = await action()

    expect(result).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        ctx: {
          message: 'Not allowed',
          name: 'Error',
          stack: err.stack,
        },
      },
    })
  })

  test('uses custom onError context when authorize throws', async () => {
    const action = createSafeServerAction(
      {
        authorize: () => {
          throw new Error('boom')
        },
        onError: () => ({ custom: 'authorize-failed' }),
      },
      async () => ({})
    )

    const result = await action()
    expect(result).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        ctx: { custom: 'authorize-failed' },
      },
    })
  })

  test('rethrows Next.js redirect errors from authorize', async () => {
    const redirectError = new Error('NEXT_REDIRECT') as Error & {
      digest: string
    }
    redirectError.digest = 'NEXT_REDIRECT;replace;/redirect-path;307;'

    const action = createSafeServerAction(
      {
        authorize: () => {
          throw redirectError
        },
      },
      async () => ({})
    )

    await expect(action()).rejects.toBe(redirectError)
  })

  test('rethrows Next.js notFound-style errors from authorize', async () => {
    const notFoundError = new Error('NEXT_NOT_FOUND') as Error & {
      digest: string
    }
    notFoundError.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'

    const action = createSafeServerAction(
      {
        authorize: () => {
          throw notFoundError
        },
      },
      async () => ({})
    )

    await expect(action()).rejects.toBe(notFoundError)
  })
})

describe('handler execution', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  test('returns SERVER_ERROR when the handler throws', async () => {
    const thrown = new Error('Handler failed')
    const action = createSafeServerAction(
      { id: 'failing-handler', debug: true },
      async () => {
        throw thrown
      }
    )

    const result = await action()

    expect(result).toEqual({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        ctx: {
          message: 'Handler failed',
          name: 'Error',
          stack: thrown.stack,
        },
      },
    })
    expect(
      errorSpy.mock.calls.some(
        (call: unknown[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('failed to execute') &&
          call[0].includes('failing-handler')
      )
    ).toBe(true)
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unexpected error'),
      thrown
    )
  })

  test('uses custom onError for handler failures', async () => {
    const action = createSafeServerAction(
      {
        onError: () => ({ reason: 'handled' }),
      },
      async () => {
        throw new Error('oops')
      }
    )

    const result = await action()
    expect(result).toEqual({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        ctx: { reason: 'handled' },
      },
    })
  })

  test('rethrows Next.js redirect errors from the handler', async () => {
    const redirectError = new Error('NEXT_REDIRECT') as Error & {
      digest: string
    }
    redirectError.digest = 'NEXT_REDIRECT;replace;/x;307;'

    const action = createSafeServerAction({}, async () => {
      throw redirectError
    })

    await expect(action()).rejects.toBe(redirectError)
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('failed to execute'),
      expect.anything()
    )
  })

  test('serializes non-Error throws in default onError context', async () => {
    const action = createSafeServerAction(
      { id: 'non-error-throw' },
      async () => {
        throw { code: 'CUSTOM' }
      }
    )

    const result = await action()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('SERVER_ERROR')
      expect(result.error.ctx).toEqual({ message: '{"code":"CUSTOM"}' })
    }
  })
})

describe('input validation', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  test('validates plain object input with a Zod schema', async () => {
    const action = createSafeServerAction(
      {
        input: z.object({
          name: z.string(),
          count: z.number(),
        }),
      },
      async ({ input }) => {
        expectTypeOf(input).toEqualTypeOf<{ name: string; count: number }>()
        return { doubled: input.count * 2 }
      }
    )

    const result = await action({ name: 'test', count: 3 })
    expect(result).toEqual({
      success: true,
      output: { doubled: 6 },
    })
  })

  test('parses FormData into an object before validation', async () => {
    const action = createSafeServerAction(
      {
        input: object({
          title: string,
          page: numeric,
        }),
      },
      async ({ input }) => ({
        title: input.title,
        page: input.page,
      })
    )

    const fd = new FormData()
    fd.set('title', 'Hello')
    fd.set('page', '42')

    const result = await action(fd)
    expect(result).toEqual({
      success: true,
      output: { title: 'Hello', page: 42 },
    })
  })

  test('returns VALIDATION_ERROR with default context when validation fails', async () => {
    const action = createSafeServerAction(
      {
        id: 'validate-me',
        input: z.object({ email: z.email() }),
        debug: true,
      },
      async () => ({})
    )

    const result = await action({ email: 'not-an-email' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
      expect(Array.isArray(result.error.ctx.issues)).toBe(true)
      expect(
        (result.error.ctx.issues as { message: string }[]).length
      ).toBeGreaterThan(0)
    }
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid input'),
      expect.anything()
    )
  })

  test('uses custom onInputValidationError when validation fails', async () => {
    const action = createSafeServerAction(
      {
        input: z.object({ id: z.uuid() }),
        onInputValidationError: (issues) => ({
          friendly: 'bad id',
          count: issues.length,
        }),
      },
      async () => ({})
    )

    const result = await action({ id: 'not-a-uuid' })
    expect(result).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        ctx: { friendly: 'bad id', count: 1 },
      },
    })
  })
})

describe('assertsNoThrow fallbacks', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  test('falls back when onInputValidationError throws', async () => {
    const action = createSafeServerAction(
      {
        id: 'input-validation-callback-throws',
        input: z.object({ email: z.email() }),
        onInputValidationError: () => {
          throw new Error('onInputValidationError exploded')
        },
      },
      async () => ({})
    )

    const result = await action({ email: 'bad' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
      expect(Array.isArray(result.error.ctx.issues)).toBe(true)
      expect(
        (result.error.ctx.issues as { message: string }[]).length
      ).toBeGreaterThan(0)
    }
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('onInputValidationError')
    )
  })

  test('falls back when onError throws after authorize throws', async () => {
    const authErr = new Error('not allowed')
    const action = createSafeServerAction(
      {
        id: 'on-error-after-authorize-throws',
        authorize: () => {
          throw authErr
        },
        onError: () => {
          throw new Error('onError callback failed')
        },
      },
      async () => ({})
    )

    const result = await action()

    expect(result).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        ctx: {
          message: 'not allowed',
          name: 'Error',
          stack: authErr.stack,
        },
      },
    })
    expect(
      errorSpy.mock.calls.some(
        (call: unknown[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('onError') &&
          call[0].includes('Falling back to default error context')
      )
    ).toBe(true)
  })

  test('falls back when onError throws after handler throws', async () => {
    const handlerErr = new Error('handler failed')
    const action = createSafeServerAction(
      {
        id: 'on-error-after-handler-throws',
        onError: () => {
          throw new Error('onError callback failed')
        },
      },
      async () => {
        throw handlerErr
      }
    )

    const result = await action()

    expect(result).toEqual({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        ctx: {
          message: 'handler failed',
          name: 'Error',
          stack: handlerErr.stack,
        },
      },
    })
    expect(
      errorSpy.mock.calls.some(
        (call: unknown[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('onError') &&
          call[0].includes('Falling back to build-in error context')
      )
    ).toBe(true)
  })
})
