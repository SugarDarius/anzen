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
