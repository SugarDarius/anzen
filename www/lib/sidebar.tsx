import type { Root } from 'fumadocs-core/page-tree'
import { cn } from './utils'

export function addSidebarBadge({
  tree,
  url,
  badge,
}: {
  tree: Root
  url: string
  badge: string
}): Root {
  return {
    ...tree,
    children: tree.children.map((node) => {
      if (node.type === 'page' && node.url === url) {
        return {
          ...node,
          name: (
            <>
              {node.name}
              <span
                className={cn(
                  'inline-flex ms-auto items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden',
                  'bg-fd-foreground/90 text-fd-background text-xs shadow-sm'
                )}
              >
                {badge}
              </span>
            </>
          ),
        }
      }
      return node
    }),
  }
}
