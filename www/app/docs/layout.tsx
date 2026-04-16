import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { source } from '~/lib/source'
import { baseOptions } from '~/lib/shared-layout'

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout {...baseOptions()} tree={source.getPageTree()}>
      {children}
    </DocsLayout>
  )
}
