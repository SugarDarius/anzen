export function ensureSynchronous<T>(
  value: T | Promise<T>,
  message: string
): asserts value is T {
  if (value instanceof Promise) {
    throw new Error(message)
  }
}

export function createLogger(debug: boolean = false) {
  return {
    info: (message: string, ...rest: unknown[]): void => {
      if (debug || process.env.NODE_ENV !== 'production') {
        console.log(message, ...rest)
      }
    },
    error: (message: string, ...rest: unknown[]): void => {
      if (debug || process.env.NODE_ENV !== 'production') {
        console.error(message, ...rest)
      }
    },
    warn: (message: string, ...rest: unknown[]): void => {
      if (debug || process.env.NODE_ENV !== 'production') {
        console.warn(message, ...rest)
      }
    },
  }
}
