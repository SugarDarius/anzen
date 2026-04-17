import type { MDXComponents } from 'mdx/types'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'fumadocs-ui/components/tabs'
import {
  CodeBlock,
  CodeBlockTabs,
  CodeBlockTab,
  Pre,
} from 'fumadocs-ui/components/codeblock'
import { Steps, Step } from 'fumadocs-ui/components/steps'
import { ImageZoom } from 'fumadocs-ui/components/image-zoom'
import { cn } from './lib/utils'
import { Callout } from './components/callout'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
      <Tabs {...props} className={cn(className, 'rounded-sm shadow-xs')} />
    ),
    TabsList,
    TabsTrigger,
    TabsContent: ({
      className,
      ...props
    }: React.ComponentProps<typeof TabsContent>) => (
      <TabsContent
        {...props}
        className={cn(
          className,
          'rounded-sm shadow-xs [&_figure]:rounded-none!'
        )}
      />
    ),
    Callout,
    CodeBlockTab: ({
      className,
      ...props
    }: React.ComponentProps<typeof CodeBlockTab>) => (
      <CodeBlockTab
        {...props}
        className={cn(
          className,
          'rounded-sm shadow-xs [&_figure]:rounded-none!'
        )}
      />
    ),
    CodeBlockTabs: (props: React.ComponentProps<typeof CodeBlockTabs>) => (
      <CodeBlockTabs
        {...props}
        className={cn(props.className, 'rounded-sm shadow-xs')}
      />
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pre: ({ ref: _ref, className, ...props }) => (
      <CodeBlock {...props} className={cn(className, 'rounded-sm shadow-xs')}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img: (props) => <ImageZoom {...(props as any)} />,
    Steps,
    Step,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
