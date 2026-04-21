import { AlertTriangle, Sparkles } from 'lucide-react'

import { cn } from '~/lib/utils'

export function ComparePane({
  variant,
  label,
  subtitle,
  children,
}: {
  variant: 'before' | 'after'
  label: string
  subtitle?: string
  children: React.ReactNode
}) {
  const isBefore = variant === 'before'

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br p-px shadow-lg ring-1 ring-inset',
        isBefore
          ? 'from-rose-500/18 via-background to-background shadow-rose-500/12 ring-rose-500/15 dark:from-rose-500/12 dark:shadow-rose-500/8'
          : 'from-emerald-500/18 via-background to-background shadow-emerald-500/12 ring-emerald-500/15 dark:from-emerald-500/12 dark:shadow-emerald-500/8'
      )}
    >
      <div className='flex min-h-0 flex-1 flex-col pt-4 overflow-hidden'>
        <div className='mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 px-4'>
          {isBefore ? (
            <AlertTriangle
              className='size-4 shrink-0 text-rose-600 dark:text-rose-400'
              aria-hidden
            />
          ) : (
            <Sparkles
              className='size-4 shrink-0 text-emerald-600 dark:text-emerald-400'
              aria-hidden
            />
          )}
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
              isBefore
                ? 'bg-rose-500/15 text-rose-800 dark:text-rose-200'
                : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
            )}
          >
            {label}
          </span>
          {subtitle ? (
            <span className='text-muted-foreground text-xs'>{subtitle}</span>
          ) : null}
        </div>
        <div
          className={cn(
            'min-w-0 flex-1 [&_figure]:my-0 [&_figure]:rounded-lg [&_figure]:border [&_figure]:border-border/80 [&_figure]:shadow-sm',
            '[&_pre]:overflow-auto [&_pre]:text-[13px] [&_pre]:leading-relaxed'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
