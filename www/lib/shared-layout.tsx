import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { BoxIcon } from 'lucide-react'

import { NPMIcon } from '~/components/icons/npm'
import { siteConfig } from '~/config/site'

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: siteConfig.github.url,
    links: [
      {
        icon: <NPMIcon />,
        label: siteConfig.npm.name,
        text: siteConfig.npm.name,
        type: 'icon',
        url: siteConfig.npm.url,
      },
    ],
    nav: {
      title: (
        <div className='bg-fd-background hover:bg-fd-accent flex w-fit items-center justify-center gap-1 rounded-full border px-2 py-1 shadow-xs transition-all'>
          <BoxIcon className='size-4' />
          <span className='text-sm font-medium'>{siteConfig.title}</span>
        </div>
      ),
      url: '/',
    },
  }
}
