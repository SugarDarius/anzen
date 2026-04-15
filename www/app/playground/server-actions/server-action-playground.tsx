'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'

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

function ResultPanel({ label, result }: { label: string; result: unknown }) {
  return (
    <div className='space-y-2'>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <pre className='max-h-48 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-left text-xs leading-relaxed font-mono text-foreground'>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className='rounded-xl border border-border bg-card/40 p-5 shadow-sm'>
      <div className='mb-4 space-y-1'>
        <h2 className='text-base font-semibold tracking-tight'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
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
    'conflict'
  )
  const [token, setToken] = useState('')

  const [reactionState, reactionFormAction, reactionPending] = useActionState(
    async (_prev: ReactionActionResult | null, formData: FormData) =>
      reactionAction(formData),
    null as ReactionActionResult | null
  )

  return (
    <div className='flex w-full flex-col gap-8'>
      <div className='space-y-2'>
        <Link
          href='/playground'
          className='text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          ← Playground
        </Link>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Safe server actions
        </h1>
        <p className='text-sm text-muted-foreground'>
          Examples using{' '}
          <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
            createSafeServerAction
          </code>{' '}
          from anzen: success payloads, validation,{' '}
          <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
            tagErr
          </code>
          , authorization, FormData,{' '}
          <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
            useActionState
          </code>
          , and Next.js{' '}
          <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
            redirect
          </code>
          .
        </p>
      </div>

      <Section
        title='Ping (no input)'
        description='Action with only context id; call with no arguments.'
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
              className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
              className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
              className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
              className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
          <p className='text-xs text-muted-foreground'>
            You should land on <code className='font-mono'>/playground</code>{' '}
            with no JSON result panel — the redirect ends the action.
          </p>
        </div>
      </Section>

      <Separator />

      <Section
        title='useActionState + FormData'
        description='React keeps the last safe action result as state; `isPending` comes from the hook (third tuple item).'
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
                defaultValue={'👍'}
                maxLength={8}
                className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
                className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
                className='h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
                className='rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
