import {
  CodeBlock,
  CodeBlockTabs,
  CodeBlockTab,
  Pre,
} from 'fumadocs-ui/components/codeblock'
import { ImageZoom } from 'fumadocs-ui/components/image-zoom'
import { Steps, Step } from 'fumadocs-ui/components/steps'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'

import { Callout } from './components/callout'
import { ComparePane } from './components/compare-pane'
import { cn } from './lib/utils'

export function getMDXComponents(components?: MDXComponents) {
  // oxlint-disable-next-line sort-keys
  return {
    ...defaultMdxComponents,
    Callout,
    ComparePane,
    CodeBlockTab: ({
      className,
      ...props
    }: React.ComponentProps<typeof CodeBlockTab>) => (
      <CodeBlockTab
        {...props}
        className={cn(
          className,
          'rounded-sm shadow-xs [&_figure]:rounded-none!',
        )}
      />
    ),
    CodeBlockTabs: (props: React.ComponentProps<typeof CodeBlockTabs>) => (
      <CodeBlockTabs
        {...props}
        className={cn(props.className, 'rounded-sm shadow-xs')}
      />
    ),
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    pre: ({ ref: _ref, className, ...props }) => (
      <CodeBlock
        {...props}
        viewportProps={{ className: 'no-max-h' }}
        className={cn(className, 'rounded-sm shadow-xs')}
      >
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    img: (props) => <ImageZoom {...(props as any)} />,
    Steps,
    Step,
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
          'rounded-sm shadow-xs [&_figure]:rounded-none!',
        )}
      />
    ),
    ...components,
  } satisfies MDXComponents
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
