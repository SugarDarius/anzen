import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { BoxIcon } from 'lucide-react'

import { siteConfig } from '~/config/site'
import { NPMIcon } from '~/components/icons/npm'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className='flex items-center border bg-fd-background justify-center w-fit rounded-full gap-1 transition-all shadow-xs hover:bg-fd-accent px-2 py-1'>
          <BoxIcon className='size-4' />
          <span className='text-sm font-medium'>{siteConfig.title}</span>
        </div>
      ),
      url: '/',
    },
    githubUrl: siteConfig.github.url,
    links: [
      {
        url: siteConfig.npm.url,
        type: 'icon',
        label: siteConfig.npm.name,
        text: siteConfig.npm.name,
        icon: <NPMIcon />,
      },
    ],
  }
}
