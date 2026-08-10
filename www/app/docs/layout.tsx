import { DocsLayout } from 'fumadocs-ui/layouts/docs'

import { baseOptions } from '~/lib/shared-layout'
import { decorateSidebarTree } from '~/lib/sidebar'
import { source } from '~/lib/source'
import { cn } from '~/lib/utils'

const IconDecorator = ({ icon }: { icon: React.ReactNode }) => (
  <span className='size-4 [&_svg]:size-full [&_svg]:stroke-[1.5]'>{icon}</span>
)

const BadgeDecorator = ({
  label,
  pageName,
}: {
  label: string
  pageName: React.ReactNode
}) => (
  <>
    {pageName}
    <span
      className={cn(
        'border-border ms-auto inline-flex w-fit shrink-0 items-center justify-center overflow-hidden rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-[color,box-shadow]',
        'bg-fd-secondary/30 text-fd-muted-foreground gap-1.5 text-[10px]',
      )}
    >
      <span className='relative flex size-1.5'>
        <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75' />
        <span className='relative inline-flex size-1.5 rounded-full bg-cyan-400' />
      </span>
      {label}
    </span>
  </>
)

const NewBadgeDecorator = ({ pageName }: { pageName: React.ReactNode }) => (
  <BadgeDecorator label='NEW' pageName={pageName} />
)

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = decorateSidebarTree({
    decorators: [
      {
        component: IconDecorator,
        type: 'page-icon',
      },
      {
        component: NewBadgeDecorator,
        type: 'page-badge',
        url: '/docs/server-action',
      },
    ],
    tree: source.getPageTree(),
  })
  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      {children}
    </DocsLayout>
  )
}
