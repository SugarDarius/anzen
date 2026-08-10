'use client'

import Link from 'next/link'
import { useActionState, useState, useTransition } from 'react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

import {
  greetAction,
  noteFromFormAction,
  pingAction,
  quantityAction,
  reactionAction,
  redirectDemoAction,
  secretAction,
  tagErrDemoAction,
} from './actions'

type ReactionActionResult = Awaited<ReturnType<typeof reactionAction>>

/** Concise snippets: full definitions live in ./actions.ts */
const SNIPPETS = {
  greet: {
    declaration: `export const greetAction = createSafeServerAction(
  {
    id: 'playground/greet',
    input: z.object({
      name: z.string().min(1, 'Name is required').max(48),
    }),
  },
  async ({ input }) => ({
    message: \`Hello, \${input.name}!\`,
  })
)`,
    usage: `await greetAction({ name })`,
  },
  noteForm: {
    declaration: `export const noteFromFormAction = createSafeServerAction(
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
)`,
    usage: `<form
  action={async (formData) => {
    const r = await noteFromFormAction(formData)
    setFormResult(r)
  }}
>…</form>`,
  },
  ping: {
    declaration: `export const pingAction = createSafeServerAction(
  { id: 'playground/ping' },
  async ({ id }) => ({
    id,
    at: new Date().toISOString(),
  })
)`,
    usage: `await pingAction()`,
  },
  quantity: {
    declaration: `export const quantityAction = createSafeServerAction(
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
)`,
    usage: `await quantityAction({ quantity })`,
  },
  reaction: {
    declaration: `export const reactionAction = createSafeServerAction(
  {
    id: 'playground/reaction',
    input: z.object({
      emoji: z.string().min(1).max(8),
      comment: z.string().max(120),
    }),
  },
  async ({ input }) => ({
    echo: \`\${input.emoji} \${input.comment}\`.trim(),
  })
)`,
    usage: `const [state, formAction, pending] = useActionState(
  async (_prev, formData) => reactionAction(formData),
  null,
)
<form action={formAction}>…</form>`,
  },
  redirect: {
    declaration: `export const redirectDemoAction = createSafeServerAction(
  { id: 'playground/redirect' },
  async () => {
    redirect('/playground')
  }
)`,
    usage: `await redirectDemoAction() // e.g. inside startTransition`,
  },
  secret: {
    declaration: `export const secretAction = createSafeServerAction(
  {
    id: 'playground/secret',
    input: z.object({ token: z.string() }),
    authorize: async ({ input }) => {
      if (input.token !== 'anzen') throw new Error('Invalid token')
      return { clearance: 'ok' as const }
    },
  },
  async ({ auth }) => ({
    authorized: true,
    clearance: auth.clearance,
  })
)`,
    usage: `await secretAction({ token })`,
  },
  tagErr: {
    declaration: `export const tagErrDemoAction = createSafeServerAction(
  {
    id: 'playground/tag-err',
    input: z.object({ outcome: z.enum(['success', 'conflict']) }),
  },
  async ({ input, tagErr }) => {
    if (input.outcome === 'conflict') {
      tagErr('RESOURCE_CONFLICT', {
        message: 'That resource is already taken.',
        resourceId: 'demo-slot-42',
      })
    }
    return { reserved: true, resourceId: 'demo-slot-42' }
  }
)`,
    usage: `await tagErrDemoAction({ outcome: tagErrOutcome })`,
  },
} as const

function CodeSnippetPair({
  declaration,
  usage,
}: {
  declaration: string
  usage: string
}) {
  return (
    <div className='border-border/70 mb-4 grid gap-3 border-b pb-4 sm:grid-cols-2'>
      <div className='min-w-0 space-y-1.5'>
        <p className='text-fd-muted-foreground text-xs font-medium'>
          <code className='text-fd-foreground/80 font-mono'>actions.ts</code>{' '}
          (declaration)
        </p>
        <pre className='border-border bg-fd-muted/30 text-fd-foreground max-h-64 overflow-auto rounded-lg border p-3 text-left font-mono text-[11px] leading-snug whitespace-pre'>
          {declaration}
        </pre>
      </div>
      <div className='min-w-0 space-y-1.5'>
        <p className='text-fd-muted-foreground text-xs font-medium'>
          Client (this page)
        </p>
        <pre className='border-border bg-fd-muted/30 text-fd-foreground max-h-64 overflow-auto rounded-lg border p-3 text-left font-mono text-[11px] leading-snug whitespace-pre'>
          {usage}
        </pre>
      </div>
    </div>
  )
}

function ResultPanel({ label, result }: { label: string; result: unknown }) {
  return (
    <div className='space-y-2'>
      <p className='text-fd-muted-foreground text-xs font-medium tracking-wide uppercase'>
        {label}
      </p>
      <pre className='border-border bg-fd-muted/40 text-fd-foreground max-h-48 overflow-auto rounded-lg border p-3 text-left font-mono text-xs leading-relaxed'>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}

function Section({
  title,
  description,
  snippets,
  children,
}: {
  title: string
  description: string
  snippets?: { declaration: string; usage: string }
  children: React.ReactNode
}) {
  return (
    <section className='border-border bg-card/40 rounded-xl border p-5 shadow-sm'>
      <div className='mb-4 space-y-1'>
        <h2 className='text-base font-semibold tracking-tight'>{title}</h2>
        <p className='text-fd-muted-foreground text-sm'>{description}</p>
      </div>
      {snippets ? (
        <CodeSnippetPair
          declaration={snippets.declaration}
          usage={snippets.usage}
        />
      ) : null}
      {children}
    </section>
  )
}

export function ServerActionPlayground() {
  const [isPending, startTransition] = useTransition()
  const [pingResult, setPingResult] = useState<unknown>(null)
  const [greetResult, setGreetResult] = useState<unknown>(null)
  const [quantityResult, setQuantityResult] = useState<unknown>(null)
  const [tagErrResult, setTagErrResult] = useState<unknown>(null)
  const [secretResult, setSecretResult] = useState<unknown>(null)
  const [formResult, setFormResult] = useState<unknown>(null)

  const [name, setName] = useState('Playground')
  const [quantity, setQuantity] = useState(3)
  const [tagErrOutcome, setTagErrOutcome] = useState<'success' | 'conflict'>(
    'conflict',
  )
  const [token, setToken] = useState('')

  const [reactionState, reactionFormAction, reactionPending] = useActionState(
    async (_prev: ReactionActionResult | null, formData: FormData) =>
      reactionAction(formData),
    null as ReactionActionResult | null,
  )

  return (
    <div className='flex w-full flex-col gap-8'>
      <div className='space-y-2'>
        <Link
          href='/playground'
          className='text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors'
        >
          ← Playground
        </Link>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Safe server actions
        </h1>
        <p className='text-fd-muted-foreground text-sm'>
          Examples using{' '}
          <code className='bg-fd-muted rounded px-1.5 py-0.5 font-mono text-xs'>
            createSafeServerAction
          </code>{' '}
          from anzen: success payloads, validation,{' '}
          <code className='bg-fd-muted rounded px-1.5 py-0.5 font-mono text-xs'>
            tagErr
          </code>
          , authorization, FormData,{' '}
          <code className='bg-fd-muted rounded px-1.5 py-0.5 font-mono text-xs'>
            useActionState
          </code>
          , and Next.js{' '}
          <code className='bg-fd-muted rounded px-1.5 py-0.5 font-mono text-xs'>
            redirect
          </code>
          .
        </p>
      </div>

      <Section
        title='Ping (no input)'
        description='Action with only context id; call with no arguments.'
        snippets={SNIPPETS.ping}
      >
        <div className='flex flex-col gap-4'>
          <Button
            type='button'
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const r = await pingAction()
                setPingResult(r)
              })
            }}
            className='w-fit'
          >
            {isPending ? 'Running…' : 'Run ping'}
          </Button>
          {pingResult !== null && (
            <ResultPanel label='Result' result={pingResult} />
          )}
        </div>
      </Section>

      <Separator />

      <Section
        title='Greet (validated object)'
        description='Zod validates the body; try an empty name to see VALIDATION_ERROR.'
        snippets={SNIPPETS.greet}
      >
        <div className='flex flex-col gap-4'>
          <div className='flex max-w-md flex-col gap-2'>
            <label className='text-sm font-medium' htmlFor='greet-name'>
              Name
            </label>
            <input
              id='greet-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
            />
          </div>
          <Button
            type='button'
            onClick={() => {
              startTransition(async () => {
                const r = await greetAction({ name })
                setGreetResult(r)
              })
            }}
            className='w-fit'
          >
            Send
          </Button>
          {greetResult !== null && (
            <ResultPanel label='Result' result={greetResult} />
          )}
        </div>
      </Section>

      <Separator />

      <Section
        title='Quantity (coerced number)'
        description='Use 0 or 100 to trigger validation failure.'
        snippets={SNIPPETS.quantity}
      >
        <div className='flex flex-col gap-4'>
          <div className='flex max-w-xs flex-col gap-2'>
            <label className='text-sm font-medium' htmlFor='qty'>
              Quantity (1–99)
            </label>
            <input
              id='qty'
              type='number'
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
            />
          </div>
          <Button
            type='button'
            onClick={() => {
              startTransition(async () => {
                const r = await quantityAction({ quantity })
                setQuantityResult(r)
              })
            }}
            className='w-fit'
          >
            Validate
          </Button>
          {quantityResult !== null && (
            <ResultPanel label='Result' result={quantityResult} />
          )}
        </div>
      </Section>

      <Separator />

      <Section
        title='Tagged error (ctx.tagErr)'
        description='Handlers call tagErr(code, ctx) to return a custom error code and payload without throwing SERVER_ERROR. Try conflict to see RESOURCE_CONFLICT.'
        snippets={SNIPPETS.tagErr}
      >
        <div className='flex flex-col gap-4'>
          <div className='flex max-w-md flex-col gap-2'>
            <label className='text-sm font-medium' htmlFor='tag-err-outcome'>
              Outcome
            </label>
            <select
              id='tag-err-outcome'
              value={tagErrOutcome}
              onChange={(e) =>
                setTagErrOutcome(e.target.value as 'success' | 'conflict')
              }
              className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
            >
              <option value='success'>Success (reserved)</option>
              <option value='conflict'>Conflict (tagErr)</option>
            </select>
          </div>
          <Button
            type='button'
            onClick={() => {
              startTransition(async () => {
                const r = await tagErrDemoAction({ outcome: tagErrOutcome })
                setTagErrResult(r)
              })
            }}
            className='w-fit'
          >
            Run
          </Button>
          {tagErrResult !== null && (
            <ResultPanel label='Result' result={tagErrResult} />
          )}
        </div>
      </Section>

      <Separator />

      <Section
        title='Secret token (authorize)'
        description='Use token anzen to pass authorize; anything else returns UNAUTHORIZED.'
        snippets={SNIPPETS.secret}
      >
        <div className='flex flex-col gap-4'>
          <div className='flex max-w-md flex-col gap-2'>
            <label className='text-sm font-medium' htmlFor='token'>
              Token
            </label>
            <input
              id='token'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder='try: anzen'
              className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
            />
          </div>
          <Button
            type='button'
            onClick={() => {
              startTransition(async () => {
                const r = await secretAction({ token })
                setSecretResult(r)
              })
            }}
            className='w-fit'
          >
            Authorize
          </Button>
          {secretResult !== null && (
            <ResultPanel label='Result' result={secretResult} />
          )}
        </div>
      </Section>

      <Separator />

      <Section
        title='Redirect (next/navigation)'
        description='Handler calls redirect(). anzen treats it as a native Next error and rethrows it, so the framework performs the navigation instead of returning SERVER_ERROR.'
        snippets={SNIPPETS.redirect}
      >
        <div className='flex flex-col gap-3'>
          <Button
            type='button'
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await redirectDemoAction()
              })
            }}
            className='w-fit'
          >
            Go to playground home
          </Button>
          <p className='text-fd-muted-foreground text-xs'>
            You should land on <code className='font-mono'>/playground</code>{' '}
            with no JSON result panel — the redirect ends the action.
          </p>
        </div>
      </Section>

      <Separator />

      <Section
        title='useActionState + FormData'
        description='React keeps the last safe action result as state; `isPending` comes from the hook (third tuple item).'
        snippets={SNIPPETS.reaction}
      >
        <form
          action={reactionFormAction}
          className='flex max-w-md flex-col gap-4'
        >
          <div className='grid gap-3'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium' htmlFor='reaction-emoji'>
                Emoji
              </label>
              <input
                id='reaction-emoji'
                name='emoji'
                required
                defaultValue='👍'
                maxLength={8}
                className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium' htmlFor='reaction-comment'>
                Comment
              </label>
              <input
                id='reaction-comment'
                name='comment'
                defaultValue='Nice API'
                maxLength={120}
                className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
              />
            </div>
          </div>
          <Button disabled={reactionPending} type='submit' className='w-fit'>
            {reactionPending ? 'Submitting…' : 'Submit with useActionState'}
          </Button>
          {reactionState !== null && (
            <ResultPanel label='State (last result)' result={reactionState} />
          )}
        </form>
      </Section>

      <Separator />

      <Section
        title='FormData'
        description='Submit as multipart form; server parses FormData then validates.'
        snippets={SNIPPETS.noteForm}
      >
        <form
          className='flex flex-col gap-4'
          action={async (formData) => {
            const r = await noteFromFormAction(formData)
            setFormResult(r)
          }}
        >
          <div className='grid max-w-md gap-3'>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium' htmlFor='title'>
                Title
              </label>
              <input
                id='title'
                name='title'
                required
                defaultValue='Note'
                className='border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium' htmlFor='body'>
                Body
              </label>
              <textarea
                id='body'
                name='body'
                rows={3}
                defaultValue='Sent via FormData.'
                className='border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2'
              />
            </div>
          </div>
          <Button type='submit' className='w-fit'>
            Submit form
          </Button>
          {formResult !== null && (
            <ResultPanel label='Result' result={formResult} />
          )}
        </form>
      </Section>
    </div>
  )
}
