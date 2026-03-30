'use server'

import type { AuthContext } from '../types'
import { createLogger } from '../utils'
import type { CreateSafeServerActionOptions } from './types'

/** @internal exported for testing only */
export const DEFAULT_ACTION_ID = '[unknown:server:action]'

/**
 * Creates a safe server action with input validation and error handling
 * for Next.js (>= 14) server actions.
 *
 * @param options - Options to configure the server action.
 * @param actionFn - The server action function.
 *
 * @returns A Next.js server action function.
 */
export function createSafeServerAction<
  AC extends AuthContext | undefined = undefined,
>(options: CreateSafeServerActionOptions<AC>) {
  const log = createLogger(options.debug)
  const id = options.id ?? DEFAULT_ACTION_ID
}
