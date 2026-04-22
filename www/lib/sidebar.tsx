import type { Root } from 'fumadocs-core/page-tree'

export type PageBadgeDecorator = {
  type: 'page-badge'
  url: string
  component: (params: { pageName: React.ReactNode }) => React.ReactNode
}

export type PageIconDecorator = {
  type: 'page-icon'
  component: (params: { icon: React.ReactNode }) => React.ReactNode
}

export type SidebarTreeDecorator = PageBadgeDecorator | PageIconDecorator

export function decorateSidebarTree({
  tree,
  decorators,
}: {
  tree: Root
  decorators: SidebarTreeDecorator[]
}): Root {
  return {
    ...tree,
    children: tree.children.map((incoming_node) => {
      switch (incoming_node.type) {
        case 'page': {
          const node = { ...incoming_node }
          for (const decorator of decorators) {
            // 👉🏻 Badge decorator
            if (decorator.type === 'page-badge') {
              if (node.url === decorator.url) {
                node.name = decorator.component({ pageName: node.name })
              }
            }

            // 👉🏻 Icon decorator
            if (decorator.type === 'page-icon') {
              if (node.icon) {
                node.icon = decorator.component({ icon: node.icon })
              }
            }
          }

          return node
        }
        default:
          return incoming_node
      }
    }),
  }
}
