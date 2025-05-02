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

export function assertsSyncOperation<T>(
  value: T | Promise<T> | PromiseLike<T>,
  message: string
): asserts value is T {
  if (isPromise<T>(value)) {
    throw new Error(message)
  }
}

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
