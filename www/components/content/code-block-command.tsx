'use client'

import { useMemo, useState } from 'react'

import { cn } from '~/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

import { CopyButton } from '~/components/ui/copy-button'

type Tabs = 'npm' | 'yarn' | 'pnpm' | 'bun'

export function CodeBlockCommand({
  className,
  npmCommand,
  yarnCommand,
  pnpmCommand,
  bunCommand,
}: {
  className?: string
  npmCommand: string
  yarnCommand: string
  pnpmCommand: string
  bunCommand: string
}) {
  const [tab, setTab] = useState<Tabs>('npm')

  const tabs = useMemo(() => {
    return {
      npm: npmCommand,
      yarn: yarnCommand,
      pnpm: pnpmCommand,
      bun: bunCommand,
    } as Record<string, string>
  }, [npmCommand, yarnCommand, pnpmCommand, bunCommand])

  const cmd = tabs[tab] ?? ''

  return (
    <div
      className={cn(
        'relative mt-6 max-h-[650px] overflow-x-auto rounded-md bg-stone-950 dark:bg-stone-900',
        className
      )}
    >
      <Tabs
        defaultValue='npm'
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tabs)
        }}
      >
        <div className='flex items-center justify-between border-b border-stone-800 bg-stone-900 px-3 pt-2.5'>
          <TabsList className='h-7 translate-y-[2px] gap-3 bg-transparent p-0 pl-1'>
            {Object.entries(tabs).map(([key]) => {
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className='rounded-none border-b border-transparent bg-transparent p-0 pb-1.5 font-mono text-stone-400 data-[state=active]:border-b-stone-50 data-[state=active]:bg-transparent data-[state=active]:text-stone-50'
                >
                  {key}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        {Object.entries(tabs).map(([key, value]) => {
          return (
            <TabsContent key={key} value={key} className='mt-0'>
              <pre className='px-4 py-5'>
                <code
                  className='relative font-mono text-sm leading-none text-stone-50'
                  data-language='bash'
                >
                  {value}
                </code>
              </pre>
            </TabsContent>
          )
        })}
      </Tabs>
      <CopyButton value={cmd} />
    </div>
  )
}
