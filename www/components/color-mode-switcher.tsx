'use client'

import { useDeferredValue } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '~/lib/utils'

const COLOR_MODES = [
  {
    mode: 'system',
    Icon: Monitor,
    label: 'system theme',
  },
  {
    mode: 'light',
    Icon: Sun,
    label: 'light theme',
  },
  {
    mode: 'dark',
    Icon: Moon,
    label: 'dark theme',
  },
] as const

export function ColorModeSwitcher() {
  const { theme, setTheme } = useTheme()
  const deferredTheme = useDeferredValue(theme, 'dark')

  return (
    <div className='flex items-center border rounded-full p-0.5 gap-0.5'>
      {COLOR_MODES.map(({ mode, Icon, label }) => (
        <button
          key={mode}
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-full transition duration-200 ease-out size-8',
            'bg-background hover:bg-accent data-active:bg-accent',
            'cursor-pointer'
          )}
          onClick={() => setTheme(mode)}
          aria-label={label}
          data-active={deferredTheme === mode ? '' : undefined}
        >
          <Icon className='size-3.5' />
        </button>
      ))}
    </div>
  )
}
