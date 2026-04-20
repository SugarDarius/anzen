'use client'

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'

import {
  docsUsageServerAction,
  docsUsageTitles,
} from '~/lib/docs-usage-snippets'
import { getFumadocsCodeBlockIconHtml } from '~/lib/fumadocs-code-block-icon'
import { cn } from '~/lib/utils'

const shikiOptions = { themes: { light: 'github-light', dark: 'vesper' } }

const iconTs = getFumadocsCodeBlockIconHtml('ts')

const examples = [
  {
    label: 'Server Action',
    lang: 'ts' as const,
    code: docsUsageServerAction,
    title: docsUsageTitles.serverAction,
    icon: iconTs,
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
