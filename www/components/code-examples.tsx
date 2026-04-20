'use client'

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'

import {
  docsUsageLayoutServerComponent,
  docsUsagePageServerComponent,
  docsUsageRouteHandler,
  docsUsageServerAction,
  docsUsageTitles,
} from '~/lib/docs-usage-snippets'
import { getFumadocsCodeBlockIconHtml } from '~/lib/fumadocs-code-block-icon'
import { SHIKI_DUAL_THEMES } from '~/lib/shiki-themes'
import { cn } from '~/lib/utils'

const shikiOptions = { themes: SHIKI_DUAL_THEMES }

const iconTs = getFumadocsCodeBlockIconHtml('ts')
const iconTsx = getFumadocsCodeBlockIconHtml('tsx')

const examples = [
  {
    label: 'Server Action',
    lang: 'ts' as const,
    code: docsUsageServerAction,
    title: docsUsageTitles.serverAction,
    icon: iconTs,
  },
  {
    label: 'Route Handler',
    lang: 'ts' as const,
    code: docsUsageRouteHandler,
    title: docsUsageTitles.routeHandler,
    icon: iconTs,
  },
  {
    label: 'Page Server Component',
    lang: 'tsx' as const,
    code: docsUsagePageServerComponent,
    title: docsUsageTitles.pageServerComponent,
    icon: iconTsx,
  },
  {
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
        'not-prose flex flex-col gap-10 w-full max-w-4xl mx-auto mt-2',
        className
      )}
    >
      {examples.map(({ label, lang, code, title, icon }) => (
        <section key={label} className='flex flex-col gap-2'>
          <DynamicCodeBlock
            lang={lang}
            code={code}
            codeblock={{
              title,
              icon,
            }}
            options={shikiOptions}
          />
        </section>
      ))}
    </div>
  )
}
