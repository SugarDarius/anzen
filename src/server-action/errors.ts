import type { ServerActionErrorContext } from './types'

/**
 * Developer defined tagged error.
 *
 * It represents an error expected to be used in the server action
 * defined by developers themselves.
 */
export class KTaggedError extends Error {
  readonly code: string
  readonly ctx: ServerActionErrorContext

  constructor(code: string, ctx: ServerActionErrorContext) {
    super('developer defined tagged error')

    this.code = code
    this.ctx = ctx

    this.name = 'KTaggedError'
  }
}

/**
 * Throws a developer defined tagged error.
 * @example
 * ```ts
 * // Server
 * export const myAction = createSafeServerAction({
 *  id: 'my action,
 * }, async (ctx) => {
 *  tagErr('CONFLICT', {
 *    message: 'resource already exists',
 *  })
 * })
 *
 * // Client
 * const result = await myAction()
 * if (result.success === false) {
 *  if (result.error.code === 'CONFLICT') {
 *    return <span>{result.error.ctx.message}</span>
 *  }
 * }
 * ```
 */
export function tagErr(code: string, ctx: ServerActionErrorContext): never {
  throw new KTaggedError(code, ctx)
}
