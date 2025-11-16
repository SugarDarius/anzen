'use client'

import { ArrowDownIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

export function Announcement({ className }: { className?: string }) {
  return (
    <Badge
      variant='secondary'
      className={cn('bg-blue-500 text-white dark:bg-blue-600', className)}
    >
      Anzen v2 is out! 🎉 New factories for page and layout server components.
      <ArrowDownIcon className='size-3.5' />
    </Badge>
  )
}
