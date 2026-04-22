import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { source } from '~/lib/source'
import { baseOptions } from '~/lib/shared-layout'
import { addSidebarBadge } from '~/lib/sidebar'

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={addSidebarBadge({
        tree: source.getPageTree(),
        url: '/docs/server-action',
        badge: 'NEW',
      })}
    >
      {children}
    </DocsLayout>
  )
}
