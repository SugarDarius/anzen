import { Card, Cards } from 'fumadocs-ui/components/card'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CodeExamples } from '~/components/code-examples'
import { RetroGrid } from '~/components/retro-grid'
import { Button } from '~/components/ui/button'
import { siteConfig } from '~/config/site'

export const metadata: Metadata = {
  openGraph: {
    images: '/og/image.webp',
  },
}

export default function Page() {
  return (
    <div className='relative flex h-full w-full flex-col'>
      <div className='absolute inset-x-0 top-0 mx-auto h-[84px] max-w-4xl'>
        <div className='absolute inset-0'>
          <RetroGrid />
        </div>
      </div>
      <section className='py-24 md:py-32'>
        <div className='container mx-auto px-4 text-center'>
          <Link
            href='/docs/server-action'
            className='border-border bg-fd-secondary/30 text-fd-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm shadow-2xs'
          >
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-cyan-400' />
            </span>
            New server action factory is out!
          </Link>
          <h1 className='mx-auto max-w-4xl text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl'>
            Type-safe factories for{' '}
            <span className='text-fd-muted-foreground'>Next.js</span>
          </h1>
          <p className='text-fd-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-balance md:text-xl'>
            Fast, flexible, framework validation agnostic factories for creating
            server actions, route handlers, page and layout Server Components.
          </p>
        </div>
        <div className='mt-10 flex flex-col items-center justify-center gap-4 pb-12 sm:flex-row'>
          <Button asChild size='lg' className='font-medium'>
            <Link href='/docs'>Read the docs</Link>
          </Button>
          <Button asChild variant='outline' size='lg' className='font-medium'>
            <a
              href='https://github.com/SugarDarius/anzen'
              className='flex items-center gap-2'
            >
              <svg
                viewBox='0 0 24 24'
                className='h-5 w-5 fill-current'
                aria-hidden='true'
              >
                <path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' />
              </svg>
              GitHub
            </a>
          </Button>
        </div>
        <div className='w-full px-4 md:px-0'>
          <CodeExamples />
        </div>
      </section>

      <section className='border-border border-t py-24 md:py-32'>
        <div className='container mx-auto px-4'>
          <h2 className='mb-4 text-center text-2xl font-bold md:text-3xl'>
            Why Anzen?
          </h2>
          <p className='text-fd-muted-foreground mx-auto mb-12 max-w-2xl text-center'>
            Anzen means &quot;safe&quot; in Japanese. Build secure, type-safe
            Next.js APIs with confidence.
          </p>
          <Cards className='mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <Card
              icon={
                <div className='flex size-6 items-center justify-center'>
                  🔧
                </div>
              }
              title='Framework validation agnostic'
            >
              Use a validation library supporting Standard Schema.
            </Card>

            <Card
              icon={
                <div className='flex size-6 items-center justify-center'>
                  🧠
                </div>
              }
              title='Focused functionalities'
            >
              Use only the features you need.
            </Card>

            <Card
              icon={
                <div className='flex size-6 items-center justify-center'>
                  🧹
                </div>
              }
              title='Clean and flexible API'
            >
              Make it your own.
            </Card>

            <Card
              icon={
                <div className='flex size-6 items-center justify-center'>
                  🔒
                </div>
              }
              title='Type-safe'
            >
              Full TypeScript inference.
            </Card>

            <Card
              icon={
                <div className='flex size-6 items-center justify-center'>
                  🌱
                </div>
              }
              title='Dependency free'
            >
              Only Next.js is required as a peer dependency.
            </Card>

            <Card
              icon={
                <div className='flex size-6 items-center justify-center'>
                  🪶
                </div>
              }
              title='Lightweight'
            >
              Your bundle is safe.
            </Card>
          </Cards>
        </div>
      </section>

      <section className='border-border border-t py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-4 text-2xl font-bold md:text-3xl'>
            Framework validation agnostic
          </h2>
          <p className='text-fd-muted-foreground mx-auto mb-8 max-w-2xl'>
            Use any validation library that implements the{' '}
            <a
              href='https://standardschema.dev'
              className='text-fd-foreground hover:text-fd-muted-foreground underline underline-offset-4 transition-colors'
            >
              Standard Schema
            </a>{' '}
            interface. Mix and match as needed.
          </p>
          <div className='flex flex-wrap justify-center gap-4'>
            {(
              [
                ['decoders', 'https://decoders.cc/docs'],
                ['Zod', 'https://zod.dev'],
                ['Valibot', 'https://valibot.dev'],
                ['ArkType', 'https://arktype.io'],
              ] as const
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                className='border-border bg-fd-secondary/30 text-fd-foreground hover:bg-fd-secondary/50 hover:border-fd-border rounded-full border px-4 py-2 text-sm font-medium transition-colors'
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className='border-border border-t py-8'>
        <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <span className='text-fd-muted-foreground text-sm'>
              &copy; 2026{' '}
              <a
                href={`${siteConfig.github.url}/blob/main/LICENSE`}
                rel='noreferrer'
                target='_blank'
                className='text-fd-foreground font-semibold underline underline-offset-2 transition-colors duration-150 ease-out'
              >
                MIT License
              </a>
            </span>
          </div>
          <p className='text-fd-muted-foreground text-sm'>
            Built with ❤️ by{' '}
            <a
              href='https://github.com/SugarDarius'
              className='text-fd-foreground underline-offset-4 hover:underline'
            >
              {siteConfig.creator}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
