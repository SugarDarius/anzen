'use client'

import { motion } from 'motion/react'
import { ArrowDownIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

export function Announcement({ className }: { className?: string }) {
  return (
    <Badge
      variant='secondary'
      className={cn('bg-blue-500 text-white dark:bg-blue-600', className)}
    >
      New server action factory is out! 🎉
      <motion.span
        className='hidden md:inline-flex'
        animate={{ translateY: [0, 2.5, 0] }}
        style={{ originX: '0%', originY: '50%' }}
        transition={{
          repeat: 6,
          repeatType: 'loop',
          delay: 0.15,
          duration: 0.6,
          type: 'tween',
          ease: 'easeInOut',
        }}
      >
        <ArrowDownIcon className='size-3.5' />
      </motion.span>
    </Badge>
  )
}
