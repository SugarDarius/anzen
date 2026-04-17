import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { baseOptions } from '~/lib/shared-layout'

export default function Layout({ children }: { children: ReactNode }) {
  const options = {
    ...baseOptions(),
    links: [
      ...(baseOptions().links ?? []),
      {
        text: (
          <div className='flex items-center rounded-full bg-fd-background justify-center w-fit gap-1.5 transition-all shadow-xs hover:bg-fd-accent px-2 py-1'>
            <BookOpen className='size-4' />
            <span className='text-sm font-medium'>Documentation</span>
          </div>
        ),
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
