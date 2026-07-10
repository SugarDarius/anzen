'use client'

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'fumadocs-ui/components/tabs'

import {
  docsUsageLayoutServerComponent,
  docsUsagePageServerComponent,
  docsUsageRouteHandler,
  docsUsageServerAction,
  docsUsageTitles,
} from '~/lib/docs-usage-snippets'
import { getFumadocsCodeBlockIconHtml } from '~/lib/fumadocs-code-block-icon'
import { cn } from '~/lib/utils'

const shikiOptions = { themes: { dark: 'vesper', light: 'github-light' } }

const iconTs = getFumadocsCodeBlockIconHtml('ts')
const iconTsx = getFumadocsCodeBlockIconHtml('tsx')

const examples = [
  {
    code: docsUsageServerAction,
    icon: iconTs,
    label: 'Server Action',
    lang: 'ts' as const,
    title: docsUsageTitles.serverAction,
    value: 'server-action',
  },
  {
    code: docsUsageRouteHandler,
    icon: iconTs,
    label: 'Route Handler',
    lang: 'ts' as const,
    title: docsUsageTitles.routeHandler,
    value: 'route-handler',
  },
  {
    code: docsUsagePageServerComponent,
    icon: iconTsx,
    label: 'Page Server Component',
    lang: 'tsx' as const,
    title: docsUsageTitles.pageServerComponent,
    value: 'page-server-component',
  },
  {
    code: docsUsageLayoutServerComponent,
    icon: iconTsx,
    label: 'Layout Server Component',
    lang: 'tsx' as const,
    title: docsUsageTitles.layoutServerComponent,
    value: 'layout-server-component',
  },
] as const

export function CodeExamples({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'not-prose flex flex-col w-full max-w-4xl mx-auto mt-2',
        className,
      )}
    >
      <Tabs defaultValue='server-action' className='rounded-sm shadow-xs'>
        <TabsList>
          {examples.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map(({ value, lang, code, title, icon }) => (
          <TabsContent
            key={value}
            value={value}
            className='rounded-sm shadow-xs [&_figure]:rounded-none!'
          >
            <DynamicCodeBlock
              lang={lang}
              code={code}
              codeblock={{
                icon,
                title,
                viewportProps: {
                  className: 'no-max-h',
                },
              }}
              options={shikiOptions}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
