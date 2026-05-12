import { notFound } from 'next/navigation'
import { ImageResponse } from '@takumi-rs/image-response'

import { getPageImage, pageSlugFromOgDocsPath, source } from '~/lib/source'
import { baseUrl } from '~/config/site'
import { OgImage } from '../../_components/og-image'

export const revalidate = false

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }))
}

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[[...slug]]'>
) {
  const { slug: pathSlug } = await params
  const page = source.getPage(pageSlugFromOgDocsPath(pathSlug))
  if (!page) {
    notFound()
  }

  const url = new URL(page.url, baseUrl).toString().replace('https://', '')

  return new ImageResponse(
    <OgImage
      title={page.data.title ?? ''}
      description={page.data.description ?? ''}
      date={page.data.lastModified?.toLocaleDateString()}
      url={url}
    />,
    {
      width: 1200,
      height: 630,
      format: 'webp',
    }
  )
}
