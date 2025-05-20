import { cn } from '~/lib/utils'
import { siteConfig } from '~/config/site'

import { GithubIcon } from '~/components/icons/github'
import { buttonVariants } from '~/components/ui/button'
import { ColorModeSwitcher } from '~/components/color-mode-switcher'

export function SiteFooter() {
  return (
    <footer className='container py-6 flex items-center justify-between relative before:absolute before:left-[calc(var(--spacing)*8*-1)] before:w-[calc(100%+(var(--spacing)*(8*2)))] before:border-b before:border-b-muted before:top-0 mt-6'>
      <span className='text-sm text-secondary-foreground'>
        &copy; 2025{' '}
        <a
          href={`${siteConfig.github.url}/blob/main/LICENSE`}
          rel='noreferrer'
          target='_blank'
          className='transition-colors duration-150 ease-out font-semibold text-foreground underline underline-offset-2'
        >
          MIT License
        </a>{' '}
        by{' '}
        {siteConfig.authors.map((author) => (
          <a
            key={author.name}
            href={author.url}
            target='_blank'
            rel='noreferrer'
            className='transition-colors duration-150 ease-out font-semibold text-foreground underline underline-offset-2'
          >
            {author.name}
          </a>
        ))}
      </span>
      <div className='flex items-center gap-1.5'>
        <a
          href={siteConfig.github.url}
          target='_blank'
          rel='noreferrer'
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'rounded-full outline-offset-2 dark:bg-background dark:hover:bg-background'
          )}
        >
          <GithubIcon className='size-3.5' />
        </a>
        <ColorModeSwitcher />
      </div>
    </footer>
  )
}
