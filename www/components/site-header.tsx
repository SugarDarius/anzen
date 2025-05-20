import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { BoxIcon } from 'lucide-react'

import { cn } from '~/lib/utils'
import { siteConfig } from '~/config/site'

import { GithubIcon } from '~/components/icons/github'
import { buttonVariants } from '~/components/ui/button'
import { RetroGrid } from '~/components/retro-grid'

const ExternalLink = ({
  href,
  children,
}: {
  href: string
  children?: React.ReactNode
}) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'group w-fit rounded-full outline-offset-2 items-center dark:bg-background dark:hover:bg-accent'
      )}
    >
      {children}
    </a>
  )
}

export async function SiteHeader() {
  const pkg = await readFile(join(process.cwd(), '../package.json'), {
    encoding: 'utf-8',
  })
  const { version } = JSON.parse(pkg)

  return (
    <header className='sticky z-50 bg-background/95 backdrop-blur top-0 w-full before:absolute before:left-[calc(var(--spacing)*8*-1)] before:w-[calc(100%+(var(--spacing)*(8*2)))] before:border-b before:border-b-muted before:bottom-0'>
      <div className='absolute inset-x-0 top-0 bottom-0.5'>
        <RetroGrid />
      </div>
      <div className='container py-6 flex items-center justify-between relative'>
        <div className='flex items-center space-x-6'>
          <ExternalLink href={siteConfig.npm.url}>
            <BoxIcon className='size-4' />
            <span className='font-medium inline'>
              {siteConfig.npm.name}
            </span>{' '}
            <span className='text-[0.625rem] text-background font-semibold bg-foreground px-1 rounded-full'>
              {version}
            </span>
          </ExternalLink>
        </div>
        <div className='hidden sm:flex items-center '>
          <ExternalLink href={siteConfig.github.url}>
            <GithubIcon className='size-3.5' />
            <span className='font-medium inline'>{siteConfig.github.name}</span>
          </ExternalLink>
        </div>
      </div>
    </header>
  )
}
