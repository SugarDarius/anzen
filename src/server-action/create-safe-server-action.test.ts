import { string, numeric, object } from 'decoders'
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
  createSafeServerAction,
  DEFAULT_ACTION_ID,
} from './create-safe-server-action'
import type {
  InferSafeServerActionResult,
  SafeServerActionError,
  SafeServerActionResult,
  ServerActionErrorContext,
} from './types'

describe('default context', () => {
  test('provides default context when no input schema', async () => {
    const action = createSafeServerAction({}, async (ctx) => {
      expectTypeOf(ctx).toEqualTypeOf<{
        readonly id: string
        readonly tagErr: (code: string, ctx: ServerActionErrorContext) => never
      }>()
      expect(ctx.id).toBe(DEFAULT_ACTION_ID)
      return { ok: true }
    })

    const result = await action()

    expect(result).toStrictEqual({
      output: { ok: true },
      success: true,
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
      expect.stringContaining(`Running server action '${DEFAULT_ACTION_ID}'`),
    )
  })

  test('uses custom id in logs when id option is set', async () => {
    const id = 'my-server-action'
    const action = createSafeServerAction({ debug: true, id }, async () => ({
      done: true,
    }))

    await action()

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Running server action '${id}'`),
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
        expect(auth.user).toStrictEqual(user)
        return { greeting: auth.user.name }
      },
    )

    const result = await action()

    expect(result).toStrictEqual({
      output: { greeting: 'Nimesh' },
      success: true,
    })
  })

  test('authorize receives id when there is no input schema', async () => {
    const action = createSafeServerAction(
      {
        authorize: async (params) => {
          expectTypeOf(params).toEqualTypeOf<{ readonly id: string }>()
          expect(params.id).toBe('auth-id-test')
          return { role: 'admin' }
        },
        id: 'auth-id-test',
      },
      async ({ auth }) => auth,
    )

    const result = await action()
    expect(result).toStrictEqual({
      output: { role: 'admin' },
      success: true,
    })
  })

  test('authorize receives id and validated input when input schema is set', async () => {
    const action = createSafeServerAction(
      {
        authorize: async (params) => {
          expect(params.id).toBe('auth-with-input')
          expect(params.input.resourceId).toBe('res-1')
          return { ok: true as const }
        },
        id: 'auth-with-input',
        input: z.object({
          resourceId: z.string(),
        }),
      },
      async ({ auth, input }) => ({ auth, input }),
    )

    const result = await action({ resourceId: 'res-1' })
    expect(result).toStrictEqual({
      output: {
        auth: { ok: true },
        input: { resourceId: 'res-1' },
      },
      success: true,
    })
  })

  test('returns UNAUTHORIZED_ERROR when authorize throws a normal error', async () => {
    const err = new Error('Not allowed')
    const action = createSafeServerAction(
      {
        authorize: () => {
          throw err
        },
        id: 'unauth-action',
      },
      async () => ({}),
    )

    const result = await action()

    expect(result).toStrictEqual({
      error: {
        code: 'UNAUTHORIZED_ERROR',
        ctx: {
          message: 'Not allowed',
          name: 'Error',
        },
      },
      success: false,
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
      async () => ({}),
    )

    const result = await action()
    expect(result).toStrictEqual({
      error: {
        code: 'UNAUTHORIZED_ERROR',
        ctx: { custom: 'authorize-failed' },
      },
      success: false,
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
      async () => ({}),
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
      async () => ({}),
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
      { debug: true, id: 'failing-handler' },
      async () => {
        throw thrown
      },
    )

    const result = await action()

    expect(result).toStrictEqual({
      error: {
        code: 'SERVER_ERROR',
        ctx: {
          message: 'Handler failed',
          name: 'Error',
        },
      },
      success: false,
    })
    expect(
      errorSpy.mock.calls.some(
        (call: unknown[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('failed to execute') &&
          call[0].includes('failing-handler'),
      ),
    ).toBeTruthy()
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unexpected error'),
      thrown,
    )
  })

  test('uses custom onError for handler failures', async () => {
    const action = createSafeServerAction(
      {
        onError: () => ({ reason: 'handled' }),
      },
      async () => {
        throw new Error('oops')
      },
    )

    const result = await action()
    expect(result).toStrictEqual({
      error: {
        code: 'SERVER_ERROR',
        ctx: { reason: 'handled' },
      },
      success: false,
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
      expect.anything(),
    )
  })

  test('serializes non-Error throws in default onError context', async () => {
    const action = createSafeServerAction(
      { id: 'non-error-throw' },
      async () => {
        throw { code: 'CUSTOM' }
      },
    )

    const result = await action()
    expect(result.success).toBeFalsy()
    if (!result.success) {
      expect(result.error.code).toBe('SERVER_ERROR')
      expect(result.error.ctx).toStrictEqual({ message: '{"code":"CUSTOM"}' })
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
          count: z.number(),
          name: z.string(),
        }),
      },
      async ({ input }) => {
        expectTypeOf(input).toEqualTypeOf<{ name: string; count: number }>()
        return { doubled: input.count * 2 }
      },
    )

    const result = await action({ count: 3, name: 'test' })
    expect(result).toStrictEqual({
      output: { doubled: 6 },
      success: true,
    })
  })

  test('parses FormData into an object before validation', async () => {
    const action = createSafeServerAction(
      {
        input: object({
          page: numeric,
          title: string,
        }),
      },
      async ({ input }) => ({
        page: input.page,
        title: input.title,
      }),
    )

    const fd = new FormData()
    fd.set('title', 'Hello')
    fd.set('page', '42')

    const result = await action(fd)
    expect(result).toStrictEqual({
      output: { page: 42, title: 'Hello' },
      success: true,
    })
  })

  test('returns VALIDATION_ERROR with default context when validation fails', async () => {
    const action = createSafeServerAction(
      {
        debug: true,
        id: 'validate-me',
        input: z.object({ email: z.email() }),
      },
      async () => ({}),
    )

    const result = await action({ email: 'not-an-email' })

    expect(result.success).toBeFalsy()
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
      expect(Array.isArray(result.error.ctx.issues)).toBeTruthy()
      expect(
        (result.error.ctx.issues as { message: string }[]).length,
      ).toBeGreaterThan(0)
    }
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid input'),
      expect.anything(),
    )
  })

  test('uses custom onInputValidationError when validation fails', async () => {
    const action = createSafeServerAction(
      {
        input: z.object({ id: z.uuid() }),
        onInputValidationError: (issues) => ({
          count: issues.length,
          friendly: 'bad id',
        }),
      },
      async () => ({}),
    )

    const result = await action({ id: 'not-a-uuid' })
    expect(result).toStrictEqual({
      error: {
        code: 'VALIDATION_ERROR',
        ctx: { count: 1, friendly: 'bad id' },
      },
      success: false,
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
      async () => ({}),
    )

    const result = await action({ email: 'bad' })

    expect(result.success).toBeFalsy()
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
      expect(Array.isArray(result.error.ctx.issues)).toBeTruthy()
      expect(
        (result.error.ctx.issues as { message: string }[]).length,
      ).toBeGreaterThan(0)
    }
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('onInputValidationError'),
    )
  })

  test('falls back when onError throws after authorize throws', async () => {
    const authErr = new Error('not allowed')
    const action = createSafeServerAction(
      {
        authorize: () => {
          throw authErr
        },
        id: 'on-error-after-authorize-throws',
        onError: () => {
          throw new Error('onError callback failed')
        },
      },
      async () => ({}),
    )

    const result = await action()

    expect(result).toStrictEqual({
      error: {
        code: 'UNAUTHORIZED_ERROR',
        ctx: {
          message: 'not allowed',
          name: 'Error',
        },
      },
      success: false,
    })
    expect(
      errorSpy.mock.calls.some(
        (call: unknown[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('onError') &&
          call[0].includes('Falling back to build-in error context'),
      ),
    ).toBeTruthy()
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
      },
    )

    const result = await action()

    expect(result).toStrictEqual({
      error: {
        code: 'SERVER_ERROR',
        ctx: {
          message: 'handler failed',
          name: 'Error',
        },
      },
      success: false,
    })
    expect(
      errorSpy.mock.calls.some(
        (call: unknown[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('onError') &&
          call[0].includes('Falling back to build-in error context'),
      ),
    ).toBeTruthy()
  })
})

describe('tagged errors', () => {
  test('returns tagged error when the handler throws a tagged error', async () => {
    const action = createSafeServerAction(
      { id: 'tagged-error' },
      async ({ tagErr }) => {
        tagErr('CONFLICT', { message: 'resource already exists' })
      },
    )

    const result = await action()
    expect(result).toStrictEqual({
      error: {
        code: 'CONFLICT',
        ctx: { message: 'resource already exists' },
      },
      success: false,
    })
  })
})

describe('infers result type', () => {
  test('infers the result type from an action with no input', () => {
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const signInWithEmail = createSafeServerAction(
      { id: 'sign-in-with-email' },
      async () => {},
    )

    type ActionResult = InferSafeServerActionResult<typeof signInWithEmail>
    type ExpectedResult = SafeServerActionResult<void, SafeServerActionError>

    expectTypeOf<ActionResult>().toEqualTypeOf<ExpectedResult>()
  })

  test('infers the result type from an action with input', () => {
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const greet = createSafeServerAction(
      {
        id: 'greet',
        input: z.object({ name: z.string() }),
      },
      async ({ input }) => ({ message: `Hello, ${input.name}` }),
    )

    type ActionResult = InferSafeServerActionResult<typeof greet>

    expectTypeOf<ActionResult>().toEqualTypeOf<
      SafeServerActionResult<{ message: string }, SafeServerActionError>
    >()
  })
})
