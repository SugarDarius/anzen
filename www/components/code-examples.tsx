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

const shikiOptions = { themes: { light: 'github-light', dark: 'vesper' } }

const iconTs = getFumadocsCodeBlockIconHtml('ts')
const iconTsx = getFumadocsCodeBlockIconHtml('tsx')

const examples = [
  {
    value: 'server-action',
    label: 'Server Action',
    lang: 'ts' as const,
    code: docsUsageServerAction,
    title: docsUsageTitles.serverAction,
    icon: iconTs,
  },
  {
    value: 'route-handler',
    label: 'Route Handler',
    lang: 'ts' as const,
    code: docsUsageRouteHandler,
    title: docsUsageTitles.routeHandler,
    icon: iconTs,
  },
  {
    value: 'page-server-component',
    label: 'Page Server Component',
    lang: 'tsx' as const,
    code: docsUsagePageServerComponent,
    title: docsUsageTitles.pageServerComponent,
    icon: iconTsx,
  },
  {
    value: 'layout-server-component',
    label: 'Layout Server Component',
    lang: 'tsx' as const,
    code: docsUsageLayoutServerComponent,
    title: docsUsageTitles.layoutServerComponent,
    icon: iconTsx,
  },
] as const

export function CodeExamples({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'not-prose flex flex-col w-full max-w-4xl mx-auto mt-2',
        className
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
                title,
                icon,
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
