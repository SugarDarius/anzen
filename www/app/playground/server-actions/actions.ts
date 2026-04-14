'use server'

import { createSafeServerAction } from '@sugardarius/anzen'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const pingAction = createSafeServerAction(
  { id: 'playground/ping' },
  async ({ id }) => ({
    id,
    at: new Date().toISOString(),
  })
)

export const greetAction = createSafeServerAction(
  {
    id: 'playground/greet',
    input: z.object({
      name: z.string().min(1, 'Name is required').max(48),
    }),
  },
  async ({ input }) => ({
    message: `Hello, ${input.name}!`,
  })
)

export const quantityAction = createSafeServerAction(
  {
    id: 'playground/quantity',
    input: z.object({
      quantity: z.coerce.number().int().min(1).max(99),
    }),
  },
  async ({ input }) => ({
    units: input.quantity,
    note: 'Validated with Zod on the server.',
  })
)

export const secretAction = createSafeServerAction(
  {
    id: 'playground/secret',
    input: z.object({ token: z.string() }),
    authorize: async ({ input }) => {
      if (input.token !== 'anzen') {
        throw new Error('Invalid token')
      }
      return { clearance: 'ok' as const }
    },
  },
  async ({ auth }) => ({
    authorized: true,
    clearance: auth.clearance,
  })
)

export const noteFromFormAction = createSafeServerAction(
  {
    id: 'playground/note-form',
    input: z.object({
      title: z.string().min(1),
      body: z.string().max(200),
    }),
  },
  async ({ input }) => ({
    saved: true,
    title: input.title,
    bodyLength: input.body.length,
  })
)

export const redirectDemoAction = createSafeServerAction(
  { id: 'playground/redirect' },
  async () => {
    redirect('/playground')
  }
)
