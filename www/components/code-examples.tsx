'use client'

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from 'fumadocs-ui/components/codeblock'

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

export function CodeExamples({ className }: { className?: string }) {
  return (
    <CodeBlockTabs
      defaultValue='server-action'
      className={cn('not-prose w-full max-w-4xl mx-auto mt-2', className)}
    >
      <CodeBlockTabsList className='px-3'>
        <CodeBlockTabsTrigger value='server-action'>
          Server Action
        </CodeBlockTabsTrigger>
        <CodeBlockTabsTrigger value='route-handler'>
          Route Handler
        </CodeBlockTabsTrigger>
        <CodeBlockTabsTrigger value='page-server-component'>
          Page Server Component
        </CodeBlockTabsTrigger>
        <CodeBlockTabsTrigger value='layout-server-component'>
          Layout Server Component
        </CodeBlockTabsTrigger>
      </CodeBlockTabsList>
      <CodeBlockTab value='server-action'>
        <DynamicCodeBlock
          lang='ts'
          code={docsUsageServerAction}
          codeblock={{
            title: docsUsageTitles.serverAction,
            icon: iconTs,
          }}
          options={shikiOptions}
        />
      </CodeBlockTab>
      <CodeBlockTab value='route-handler'>
        <DynamicCodeBlock
          lang='ts'
          code={docsUsageRouteHandler}
          codeblock={{
            title: docsUsageTitles.routeHandler,
            icon: iconTs,
          }}
          options={shikiOptions}
        />
      </CodeBlockTab>
      <CodeBlockTab value='page-server-component'>
        <DynamicCodeBlock
          lang='tsx'
          code={docsUsagePageServerComponent}
          codeblock={{
            title: docsUsageTitles.pageServerComponent,
            icon: iconTsx,
          }}
          options={shikiOptions}
        />
      </CodeBlockTab>
      <CodeBlockTab value='layout-server-component'>
        <DynamicCodeBlock
          lang='tsx'
          code={docsUsageLayoutServerComponent}
          codeblock={{
            title: docsUsageTitles.layoutServerComponent,
            icon: iconTsx,
          }}
          options={shikiOptions}
        />
      </CodeBlockTab>
    </CodeBlockTabs>
  )
}
