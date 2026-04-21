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
                  'inline-flex ms-auto items-center justify-center rounded-full border border-border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden',
                  'bg-fd-secondary/30 text-fd-muted-foreground text-[10px] gap-1.5'
                )}
              >
                <span className='relative flex size-1.5'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full size-1.5 bg-cyan-400'></span>
                </span>
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
