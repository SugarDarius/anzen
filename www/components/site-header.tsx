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
        'w-fit rounded-full outline-offset-2 items-center'
      )}
    >
      {children}
    </a>
  )
}

export function SiteHeader() {
  return (
    <header className='sticky z-50 bg-background/95 backdrop-blur top-0 w-full'>
      <RetroGrid />
      <div className='container py-8 flex items-center justify-between relative'>
        <div className='flex items-center space-x-6'>
          <ExternalLink href={siteConfig.npm.url}>
            <BoxIcon className='size-4' />
            <span className='font-medium inline'>{siteConfig.npm.name}</span>
          </ExternalLink>
        </div>
        <div className='flex items-center space-x-2 md:space-x-4'>
          <ExternalLink href={siteConfig.github.url}>
            <GithubIcon className='size-3.5' />
            <span className='font-medium inline'>{siteConfig.github.name}</span>
          </ExternalLink>
        </div>
      </div>
    </header>
  )
}
