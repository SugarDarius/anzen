'use server'

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
export function createSafeServerAction() {}
