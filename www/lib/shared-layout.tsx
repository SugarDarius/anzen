import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

import { siteConfig } from '~/config/site'
import { NPMIcon } from '~/components/icons/npm'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: siteConfig.title,
      url: '/docs',
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
