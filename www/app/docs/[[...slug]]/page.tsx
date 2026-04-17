import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'

import { source } from '~/lib/source'
import { getMDXComponents } from '~/mdx-components'
import { RetroGrid } from '~/components/retro-grid'
import { PageActions } from '~/components/ai/page-actions'
import { siteConfig } from '~/config/site'

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>
): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
  }
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: true }}
      className='relative'
    >
      <div className='absolute top-0 w-full h-[84px] left-0 right-0'>
        <div className='absolute inset-0'>
          <RetroGrid />
        </div>
      </div>
      <div className='flex flex-col w-full z-1'>
        <div className='flex items-start justify-between gap-4 mb-8'>
          <DocsTitle>{page.data.title}</DocsTitle>
          <PageActions
            markdownUrl={`${page.url}.mdx`}
            githubUrl={`${siteConfig.github.url}/blob/www/main/content/${page.url}.mdx`}
          />
        </div>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </div>
      {page.data.lastModified ? (
        <PageLastUpdate date={page.data.lastModified} />
      ) : null}
    </DocsPage>
  )
}
