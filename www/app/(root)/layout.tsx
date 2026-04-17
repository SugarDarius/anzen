import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import type { ReactNode } from 'react'
import { baseOptions } from '~/lib/shared-layout'

export default function Layout({ children }: { children: ReactNode }) {
  const options = {
    ...baseOptions(),
    links: [
      ...(baseOptions().links ?? []),
      {
        text: 'Documentation',
        url: '/docs',
      },
    ],
  } satisfies BaseLayoutProps
  return (
    <div>
      <HomeLayout {...options}>{children}</HomeLayout>
    </div>
  )
}
