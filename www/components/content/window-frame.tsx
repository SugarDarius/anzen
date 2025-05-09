import { cn } from '~/lib/utils'

export function WindowFrame({
  className,
  title,
  children,
}: {
  className?: string
  title?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative flex h-auto min-h-[240px] w-[466px] max-w-full flex-col overflow-hidden rounded-md border shadow-md',
        className
      )}
    >
      <div className='relative flex h-[36px] w-full flex-none flex-row items-center border-b'>
        <div className='absolute left-0 top-0 flex h-full flex-row items-center gap-2 pl-3'>
          <div className='size-3 rounded-full bg-[#ff5f56]' />
          <div className='size-3 rounded-full bg-[#ffbd2e]' />
          <div className='size-3 rounded-full bg-[#27c93f]' />
        </div>
        <div className='flex h-full w-full flex-row items-center justify-center'>
          <span className='text-xs'>{title ?? 'Untitled'}</span>
        </div>
      </div>
      <div className='flex w-full flex-auto flex-col'>{children}</div>
    </div>
  )
}
