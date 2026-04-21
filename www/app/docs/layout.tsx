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
      tabs={{
        transform: (option, node) => {
          const meta = source.getNodeMeta(node)
          if (!meta || !node.icon) {
            return null
          }

          return {
            ...option,
            icon: (
              <div className='[&_svg]:size-full rounded-lg size-full text-(--color-fd-foreground) max-md:bg-(--color-fd-foreground)/10 max-md:border max-md:p-1.5'>
                {node.icon}
              </div>
            ),
          }
        },
      }}
    >
      {children}
    </DocsLayout>
  )
}
