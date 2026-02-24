/** @internal */
export function hasDictKey<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<typeof key, unknown> {
  return key in obj
}

/** @internal */
export function isPromise<T>(
  value: unknown
): value is Promise<T> | PromiseLike<T> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).then === 'function'
  )
}

/** @internal */
export function assertsSyncOperation<T>(
  value: T | Promise<T> | PromiseLike<T>,
  message: string
): asserts value is T {
  if (isPromise<T>(value)) {
    throw new Error(message)
  }
}

/** @internal */
export function createLogger(debug: boolean = false) {
  const shouldLog = debug || process.env.NODE_ENV !== 'production'
  return {
    info: (message: string, ...rest: unknown[]): void => {
      if (shouldLog) {
        console.log(message, ...rest)
      }
    },
    error: (message: string, ...rest: unknown[]): void => {
      if (shouldLog) {
        console.error(message, ...rest)
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
    start: (): void => {
      startTime = performance.now()
    },
    stop: (): void => {
      if (startTime === null) {
        throw new Error('Execution clock was not started.')
      }
      endTime = performance.now()
    },
    get: (): string => {
      if (!startTime || !endTime) {
        throw new Error('Execution clock has not been started or stopped.')
      }

      const duration = endTime - startTime
      return `${duration.toFixed(2)}ms`
    },
  }
}

/**
 * @internal
 * Checks if an error is a Next.js redirect error.
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
 * @internal
 * Checks if an error is a Next.js HTTP error (notFound, forbidden, unauthorized).
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
  const digest = error.digest
  // Check for notFound (;404), forbidden (;403), or unauthorized (;401)
  return (
    digest.endsWith(';404') ||
    digest.endsWith(';403') ||
    digest.endsWith(';401')
  )
}

/**
 * @internal
 * Checks if an error is a Next.js native error that should not be logged.
 */
export function isNextNativeError(error: unknown): boolean {
  return isNextRedirectError(error) || isNextHttpError(error)
}
