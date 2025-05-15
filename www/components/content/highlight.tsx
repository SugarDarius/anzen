import { cn } from '~/lib/utils'
import { Separator } from '~/components/ui/separator'

export function Highlight({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col items-center justify-center gap-2.5',
        className
      )}
    >
      {children}
      <Separator className='max-w-xl' />
    </div>
  )
}
