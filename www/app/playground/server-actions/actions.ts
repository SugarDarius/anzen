'use server'

import { createSafeServerAction } from '@sugardarius/anzen'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const pingAction = createSafeServerAction(
  { id: 'playground/ping' },
  async ({ id }) => ({
    at: new Date().toISOString(),
    id,
  }),
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
  }),
)

export const quantityAction = createSafeServerAction(
  {
    id: 'playground/quantity',
    input: z.object({
      quantity: z.coerce.number().int().min(1).max(99),
    }),
  },
  async ({ input }) => ({
    note: 'Validated with Zod on the server.',
    units: input.quantity,
  }),
)

export const tagErrDemoAction = createSafeServerAction(
  {
    id: 'playground/tag-err',
    input: z.object({
      outcome: z.enum(['success', 'conflict']),
    }),
  },
  async ({ input, tagErr }) => {
    if (input.outcome === 'conflict') {
      tagErr('RESOURCE_CONFLICT', {
        message: 'That resource is already taken.',
        resourceId: 'demo-slot-42',
      })
    }
    return { reserved: true, resourceId: 'demo-slot-42' }
  },
)

export const secretAction = createSafeServerAction(
  {
    authorize: async ({ input }) => {
      if (input.token !== 'anzen') {
        throw new Error('Invalid token')
      }
      return { clearance: 'ok' as const }
    },
    id: 'playground/secret',
    input: z.object({ token: z.string() }),
  },
  async ({ auth }) => ({
    authorized: true,
    clearance: auth.clearance,
  }),
)

export const noteFromFormAction = createSafeServerAction(
  {
    id: 'playground/note-form',
    input: z.object({
      body: z.string().max(200),
      title: z.string().min(1),
    }),
  },
  async ({ input }) => ({
    bodyLength: input.body.length,
    saved: true,
    title: input.title,
  }),
)

export const reactionAction = createSafeServerAction(
  {
    id: 'playground/reaction',
    input: z.object({
      comment: z.string().max(120),
      emoji: z.string().min(1).max(8),
    }),
  },
  async ({ input }) => ({
    echo: `${input.emoji} ${input.comment}`.trim(),
  }),
)

export const redirectDemoAction = createSafeServerAction(
  { id: 'playground/redirect' },
  async () => {
    redirect('/playground')
  },
)
