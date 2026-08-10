import { findNeighbour } from 'fumadocs-core/page-tree'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { ArrowLeft, ArrowRight, ExternalLinkIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageActions } from '~/components/ai/page-actions'
import { GithubIcon } from '~/components/icons/github'
import { RetroGrid } from '~/components/retro-grid'
import { Button } from '~/components/ui/button'
import { siteConfig } from '~/config/site'
import { getPageImage, source } from '~/lib/source'
import { getMDXComponents } from '~/mdx-components'

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    notFound()
  }

  return {
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
    title: page.data.title,
  }
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) {
    notFound()
  }

  const MDXRenderer = page.data.body
  const githubUrl = `${siteConfig.github.url}/blob/main/www/content/docs/${page.path}`

  const neighbours = findNeighbour(source.pageTree, page.url)

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: true }}
      className='relative'
      tableOfContent={{
        footer: (
          <div className='flex items-center'>
            <Button
              asChild
              size='xs'
              variant='ghost'
              className='hover:border-fd-border group w-full justify-start gap-1.5 border border-transparent'
            >
              <Link href={githubUrl} target='_blank' rel='noopener noreferrer'>
                <GithubIcon className='size-3.5' />
                Edit on Github
                <ExternalLinkIcon className='-ml-0.5 size-3 opacity-0 transition duration-150 ease-out group-hover:opacity-100' />
              </Link>
            </Button>
          </div>
        ),
        style: 'clerk',
      }}
      footer={{
        component: (
          <footer className='border-border flex-noe container border-t pt-6'>
            <div className='flex w-full flex-col items-center justify-between gap-2 sm:flex-row'>
              <div className='flex items-center gap-2'>
                <span className='text-fd-muted-foreground text-sm'>
                  &copy; 2026{' '}
                  <a
                    href={`${siteConfig.github.url}/blob/main/LICENSE`}
                    rel='noreferrer'
                    target='_blank'
                    className='text-fd-foreground font-semibold underline underline-offset-2 transition-colors duration-150 ease-out'
                  >
                    MIT License
                  </a>
                </span>
              </div>
              <p className='text-fd-muted-foreground text-sm'>
                Built with ❤️ by{' '}
                <a
                  href='https://github.com/SugarDarius'
                  className='text-fd-foreground underline-offset-4 hover:underline'
                >
                  {siteConfig.creator}
                </a>
              </p>
            </div>
          </footer>
        ),
        enabled: true,
      }}
    >
      <div className='absolute top-0 right-0 left-0 h-[84px] w-full'>
        <div className='absolute inset-0'>
          <RetroGrid />
        </div>
      </div>
      <div className='z-1 flex w-full flex-col'>
        <div className='mb-8 flex flex-col items-center justify-between gap-2 md:flex-row md:gap-4'>
          <DocsTitle className='flex-1 text-lg md:text-[1.75em]'>
            {page.data.title}
          </DocsTitle>
          <div className='flex flex-none items-center gap-2'>
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
                  className='bg-fd-popover border-md border-fd-border hover:bg-fd-accent hover:text-fd-accent-foreground border shadow-xs transition-colors duration-150 ease-in-out'
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
                  className='bg-fd-popover border-md border-fd-border hover:bg-fd-accent hover:text-fd-accent-foreground border shadow-xs transition-colors duration-150 ease-in-out'
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
          <MDXRenderer
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
