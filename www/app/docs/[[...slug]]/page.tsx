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

import { getPageImage, source } from '~/lib/source'
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
    openGraph: {
      images: getPageImage(page).url,
    },
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
      tableOfContent={{ style: 'clerk' }}
      footer={{
        enabled: true,
        component: (
          <footer className='container pt-6 flex items-center justify-between relative border-t'>
            <span className='text-sm  text-fd-secondary-foreground'>
              &copy; 2026{' '}
              <a
                href={`${siteConfig.github.url}/blob/main/LICENSE`}
                rel='noreferrer'
                target='_blank'
                className='transition-colors duration-150 ease-out font-semibold text-foreground underline underline-offset-2'
              >
                MIT License
              </a>
              , with ❤️{' '}
              <span className='hidden sm:inline'>
                by{' '}
                {siteConfig.authors.map((author) => (
                  <a
                    key={author.name}
                    href={author.url}
                    target='_blank'
                    rel='noreferrer'
                    className='transition-colors duration-150 ease-out font-semibold text-foreground underline underline-offset-2'
                  >
                    {author.name}
                  </a>
                ))}
              </span>
            </span>
          </footer>
        ),
      }}
    >
      <div className='absolute top-0 w-full h-[84px] left-0 right-0'>
        <div className='absolute inset-0'>
          <RetroGrid />
        </div>
      </div>
      <div className='flex flex-col w-full z-1'>
        <div className='flex items-center justify-between gap-4 mb-8'>
          <DocsTitle className=' text-lg md:text-[1.75em]'>
            {page.data.title}
          </DocsTitle>
          <PageActions
            markdownUrl={`${page.url}.mdx`}
            githubUrl={`${siteConfig.github.url}/blob/main/www/content/docs/${page.path}`}
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
      <div className='w-full border-t' />
      {page.data.lastModified ? (
        <PageLastUpdate date={page.data.lastModified} />
      ) : null}
    </DocsPage>
  )
}
