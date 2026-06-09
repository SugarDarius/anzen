import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { siteConfig } from '~/config/site'
import { getPageImage, source } from '~/lib/source'
import { getMDXComponents } from '~/mdx-components'
import { RetroGrid } from '~/components/retro-grid'
import { PageActions } from '~/components/ai/page-actions'
import { GithubIcon } from '~/components/icons/github'
import { Button } from '~/components/ui/button'
import { ExternalLinkIcon } from 'lucide-react'
import { findNeighbour } from 'fumadocs-core/page-tree'

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
  const githubUrl = `${siteConfig.github.url}/blob/main/www/content/docs/${page.path}`

  const neighbours = findNeighbour(source.pageTree, page.url)

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: true }}
      className='relative'
      tableOfContent={{
        style: 'clerk',
        footer: (
          <div className='flex items-center'>
            <Button
              asChild
              size='xs'
              variant='ghost'
              className='w-full justify-start border-transparent border hover:border-fd-border group gap-1.5'
            >
              <Link href={githubUrl} target='_blank' rel='noopener noreferrer'>
                <GithubIcon className='size-3.5' />
                Edit on Github
                <ExternalLinkIcon className='size-3 -ml-0.5 opacity-0 transition duration-150 ease-out group-hover:opacity-100' />
              </Link>
            </Button>
          </div>
        ),
      }}
      footer={{
        enabled: true,
        component: (
          <footer className='container pt-6 border-t border-border flex-noe'>
            <div className='w-full flex flex-col sm:flex-row items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-fd-muted-foreground'>
                  &copy; 2026{' '}
                  <a
                    href={`${siteConfig.github.url}/blob/main/LICENSE`}
                    rel='noreferrer'
                    target='_blank'
                    className='transition-colors duration-150 ease-out font-semibold text-fd-foreground underline underline-offset-2'
                  >
                    MIT License
                  </a>
                </span>
              </div>
              <p className='text-sm text-fd-muted-foreground'>
                Built with ❤️ by{' '}
                <a
                  href='https://github.com/SugarDarius'
                  className='text-fd-foreground hover:underline underline-offset-4'
                >
                  {siteConfig.creator}
                </a>
              </p>
            </div>
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
        <div className='flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-8'>
          <DocsTitle className='text-lg md:text-[1.75em] flex-1'>
            {page.data.title}
          </DocsTitle>
          <div className='flex items-center gap-2 flex-none'>
            <PageActions
              markdownUrl={`${page.url}.mdx`}
              githubUrl={githubUrl}
            />
            <div className='flex items-center gap-1'>
              {neighbours.previous ? (
                <Button
                  asChild
                  variant='secondary'
                  size='icon'
                  className='bg-fd-popover shadow-xs border border-md border-fd-border transition-colors duration-150 ease-in-out hover:bg-fd-accent hover:text-fd-accent-foreground'
                >
                  <Link href={neighbours.previous.url}>
                    <ArrowLeft className='size-4' />
                    <span className='sr-only'>Previous</span>
                  </Link>
                </Button>
              ) : null}
              {neighbours.next ? (
                <Button
                  asChild
                  variant='secondary'
                  size='icon'
                  className='bg-fd-popover shadow-xs border border-md border-fd-border transition-colors duration-150 ease-in-out hover:bg-fd-accent hover:text-fd-accent-foreground'
                >
                  <Link href={neighbours.next.url}>
                    <ArrowRight className='size-4' />
                    <span className='sr-only'>Next</span>
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
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
