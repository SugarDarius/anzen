import type { MDXComponents } from 'mdx/types'

import { cn } from '~/lib/utils'
import { WindowFrame } from '~/components/content/window-frame'
import { CodeBlockCommand } from '~/components/content/code-block-command'
import { Highlight } from '~/components/content/highlight'

const components: MDXComponents = {
  a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a
      className={cn('font-medium underline underline-offset-4', className)}
      {...props}
      target='_blank'
      rel='noreferrer noopenner'
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        'relative rounded p-[0.2rem] font-mono text-sm bg-muted',
        className
      )}
      {...props}
    />
  ),
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'font-heading mt-2 scroll-m-20 text-4xl font-bold',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        'font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        'font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      className={cn(
        'mt-8 scroll-m-20 text-lg font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      className={cn(
        'mt-8 scroll-m-20 text-base font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
  Highlight,
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className='my-4 md:my-8' {...props} />
  ),
  pre: ({
    children,
    className,
    __rawString__,
    __title__,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & {
    __rawString__?: string
    __title__?: string
  }) => {
    const isNPMCommand =
      __rawString__ &&
      (__rawString__.startsWith('npm i') ||
        __rawString__.startsWith('npm install'))

    if (isNPMCommand) {
      const npmCommand = __rawString__.trim()
      const yarnCommand = npmCommand.replace('npm i', 'yarn add')
      const pnpmCommand = npmCommand.replace('npm i', 'pnpm add')
      const bunCommand = npmCommand.replace('npm i', 'bun add')

      return (
        <CodeBlockCommand
          npmCommand={npmCommand}
          yarnCommand={yarnCommand}
          pnpmCommand={pnpmCommand}
          bunCommand={bunCommand}
        />
      )
    }
    return (
      <WindowFrame
        className='w-full mt-6 max-w-5xl mx-auto bg-stone-950 text-background dark:text-foreground'
        title={__title__ ?? 'api/route.ts'}
        value={__rawString__}
      >
        <pre
          className={cn(
            'relative py-4 px-2 w-ful font-mono cursor-text outline-none bg-stone-950',
            '[&_code]:!bg-transparent',
            className
          )}
          {...props}
        >
          {children}
        </pre>
      </WindowFrame>
    )
  },
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn('leading-7 [&:not(:first-child)]:mt-4', className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('mt-6 ml-6 list-disc', className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li className={cn('mt-2', className)} {...props} />
  ),
}

export function useMDXComponents(overrides: MDXComponents): MDXComponents {
  return {
    ...components,
    ...overrides,
  }
}
