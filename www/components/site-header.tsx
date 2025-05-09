import { BoxIcon } from 'lucide-react'

import { cn } from '~/lib/utils'
import { siteConfig } from '~/config/site'

import { GithubIcon } from '~/components/icons/github'
import { buttonVariants } from '~/components/ui/button'
import { RetroGrid } from '~/components/retro-grid'

export function SiteHeader() {
  return (
    <header className='sticky z-50 bg-background/90 backdrop-blur top-0 w-full'>
      <RetroGrid />
      <div className='container py-8 flex items-center justify-between relative'>
        <div className='flex items-center space-x-6'>
          <a
            href={siteConfig.npm.url}
            target='_blank'
            rel='noreferrer'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit rounded-full outline-offset-2 items-center'
            )}
          >
            <BoxIcon className='size-4' />
            <span className='font-medium inline'>{siteConfig.npm.name}</span>
          </a>
        </div>
        <div className='flex items-center space-x-2 md:space-x-4'>
          <a
            href={siteConfig.github.url}
            target='_blank'
            rel='noreferrer'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit rounded-full outline-offset-2 items-center'
            )}
          >
            <GithubIcon className='size-3.5' />
            <span className='font-medium inline'>{siteConfig.github.name}</span>
          </a>
        </div>
      </div>
    </header>
  )
}
