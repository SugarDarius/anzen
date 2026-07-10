import type { Awaitable } from './types'

/** @internal */
export function hasDictKey<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<typeof key, unknown> {
  return key in obj
}

/** @internal */
export function isPromise<T>(
  value: unknown,
): value is Promise<T> | PromiseLike<T> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).then === 'function'
  )
}

/** @internal */
export function assertsSyncOperation<T>(
  value: T | Promise<T> | PromiseLike<T>,
  message: string,
): asserts value is T {
  if (isPromise<T>(value)) {
    throw new Error(message)
  }
}

/** @internal */
export function createLogger(debug = false) {
  const shouldLog = debug || process.env.NODE_ENV !== 'production'
  return {
    error: (message: string, ...rest: unknown[]): void => {
      if (shouldLog) {
        console.error(message, ...rest)
      }
    },
    info: (message: string, ...rest: unknown[]): void => {
      if (shouldLog) {
        console.log(message, ...rest)
      }
    },
    warn: (message: string, ...rest: unknown[]): void => {
      if (shouldLog) {
        console.warn(message, ...rest)
      }
    },
  }
}

/** @internal */
export function createExecutionClock() {
  let startTime: number | null = null
  let endTime: number | null = null

  return {
    get: (): string => {
      if (!startTime || !endTime) {
        throw new Error('Execution clock has not been started or stopped.')
      }

      const duration = endTime - startTime
      return `${duration.toFixed(2)}ms`
    },
    start: (): void => {
      startTime = performance.now()
    },
    stop: (): void => {
      if (startTime === null) {
        throw new Error('Execution clock was not started.')
      }
      endTime = performance.now()
    },
  }
}

/**
 * Checks if an error is a Next.js redirect error.
 * @internal
 */
const isNextRedirectError = (error: unknown): boolean => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('digest' in error) ||
    typeof error.digest !== 'string'
  ) {
    return false
  }
  return error.digest.startsWith('NEXT_REDIRECT;')
}

/**
 * Checks if an error is a Next.js HTTP error (notFound, forbidden, unauthorized).
 * @internal
 */
const isNextHttpError = (error: unknown): boolean => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('digest' in error) ||
    typeof error.digest !== 'string'
  ) {
    return false
  }
  const { digest } = error
  // Check for notFound (;404), forbidden (;403), or unauthorized (;401)
  return (
    digest.endsWith(';404') ||
    digest.endsWith(';403') ||
    digest.endsWith(';401')
  )
}

/**
 * Checks if an error is a Next.js native error that should not be logged.
 * @internal
 */
export function isNextNativeError(error: unknown): boolean {
  return isNextRedirectError(error) || isNextHttpError(error)
}

/**
 * Type guard to check if the error is an instance of Error.
 * @internal
 */
export function isNativeError(err: unknown): err is Error {
  return err instanceof Error
}

/**
 * Asserts that a function do not throw
 * @internal
 */
export async function assertsNoThrow<T>(
  fn: () => Awaitable<T>,
  fallback: () => Awaitable<T>,
): Promise<T> {
  try {
    return await fn()
  } catch {
    return await fallback()
  }
}
