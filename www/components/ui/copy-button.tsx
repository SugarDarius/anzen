'use client'

import { useCallback } from 'react'
import { CheckIcon, ClipboardIcon } from 'lucide-react'

import { cn } from '~/lib/utils'
import { useCopyToClipboard } from '~/hooks/use-copy-to-clipboard'
import { Button } from '~/components/ui/button'

export function CopyButton({
  className,
  value,
}: {
  className?: string
  value: string
}) {
  const [copied, copy] = useCopyToClipboard()
  const handleCopy = useCallback((): void => {
    copy(value)
  }, [copy, value])

  return (
    <Button
      size='icon'
      variant='ghost'
      className={cn(
        'absolute right-2.5 top-2 z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3',
        className
      )}
      onClick={handleCopy}
    >
      <span className='sr-only'>Copy</span>
      {copied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  )
}
