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
        <div className='flex items-center border bg-fd-background justify-center w-fit rounded-full gap-1 transition-all shadow-xs hover:bg-fd-accent px-2 py-1'>
          <BoxIcon className='size-4' />
          <span className='text-sm font-medium'>{siteConfig.title}</span>
        </div>
      ),
      url: '/',
    },
  }
}
