'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        xs: 'h-7 rounded-md px-2 text-xs has-[>svg]:px-1.5',
      },
      variant: {
        default:
          'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 shadow-xs',
        destructive:
          'bg-fd-destructive hover:bg-fd-destructive/90 focus-visible:ring-fd-destructive/20 dark:focus-visible:ring-fd-destructive/40 dark:bg-fd-destructive/60 text-white shadow-xs',
        ghost:
          'hover:bg-fd-accent hover:text-fd-accent-foreground dark:hover:bg-fd-accent/50',
        link: 'text-fd-primary underline-offset-4 hover:underline',
        outline:
          'bg-fd-background hover:bg-fd-accent hover:text-fd-accent-foreground dark:bg-fd-input/30 dark:border-fd-input dark:hover:bg-fd-input/50 border shadow-xs',
        secondary:
          'bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-secondary/80 shadow-xs',
      },
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
