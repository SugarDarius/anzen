import { siteConfig } from '~/config/site'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/button'

export function SiteHeader() {
  return (
    <header className='sticky z-50 bg-background/90 backdrop-blur top-0 w-full'>
      <div className='container h-16 flex items-center justify-between'>
        <div className='flex items-center space-x-6'>
          <a
            href={siteConfig.npm.url}
            target='_blank'
            rel='noreferrer'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit rounded-full outline-offset-2'
            )}
          >
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
              'w-fit rounded-full outline-offset-2'
            )}
          >
            <span className='font-medium inline'>{siteConfig.github.name}</span>
          </a>
        </div>
      </div>
    </header>
  )
}
