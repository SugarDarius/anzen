export function ensureSynchronous<T>(
  value: T | Promise<T>,
  message: string
): asserts value is T {
  if (value instanceof Promise) {
    throw new Error(message)
  }
}
