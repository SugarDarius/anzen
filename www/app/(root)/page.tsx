import Link from 'next/link'
import { CodeExamples } from '~/components/code-examples'
import { RetroGrid } from '~/components/retro-grid'
import { Button } from '~/components/ui/button'

export default function Page() {
  return (
    <div className='flex flex-col w-full h-full relative'>
      <div className='absolute top-0 max-w-4xl inset-x-0 mx-auto h-[84px]'>
        <div className='absolute inset-0'>
          <RetroGrid />
        </div>
      </div>
      <section className='py-24 md:py-32'>
        <div className='container mx-auto px-4 text-center'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-fd-secondary/30 text-sm text-fd-muted-foreground mb-6'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-fd-accent opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-fd-diff-add-symbol'></span>
            </span>
            New server action factory is out!
          </div>
          <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance max-w-4xl mx-auto'>
            Type-safe factories for{' '}
            <span className='text-fd-muted-foreground'>Next.js</span>
          </h1>
          <p className='mt-6 text-lg md:text-xl text-fd-muted-foreground max-w-2xl mx-auto text-balance'>
            Fast, flexible, framework validation agnostic factories for creating
            server actions, route handlers, page and layout Server Components.
          </p>
        </div>
        <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pb-12'>
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
        <CodeExamples />
      </section>

      <footer className='py-8 border-t border-border'>
        <div className='container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-fd-muted-foreground'>
              @sugardarius/anzen
            </span>
          </div>
          <p className='text-sm text-fd-muted-foreground'>
            Built by{' '}
            <a
              href='https://github.com/SugarDarius'
              className='text-fd-foreground hover:underline underline-offset-4'
            >
              SugarDarius
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
