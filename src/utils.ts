export function ensureSynchronous<T>(
  value: T | Promise<T>,
  message: string
): asserts value is T {
  if (value instanceof Promise) {
    throw new Error(message)
  }
}

export function log(message: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message)
  }
}
