import { baseUrl } from '~/config/site'
import { source } from '~/lib/source'

const RFC9727_PROFILE = 'https://www.rfc-editor.org/info/rfc9727'

export const revalidate = false

const url = (path: string) => new URL(path, baseUrl).toString()

const catalogUri = () => url('/.well-known/api-catalog')

export function HEAD() {
  return new Response(null, {
    headers: {
      Link: `<${catalogUri()}>; rel="api-catalog"`,
    },
    status: 204,
  })
}

export function GET() {
  const pages = source.getPages()
  const hrefs = [
    url('/api/search'),
    url('/llms.txt'),
    url('/docs'),
    ...pages.map((page) => url(page.url)),
  ]

  const body = {
    linkset: [
      {
        anchor: catalogUri(),
        item: [...new Set(hrefs)].map((href) => ({ href })),
      },
    ],
  }

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Type': `application/linkset+json; profile="${RFC9727_PROFILE}"`,
    },
  })
}
