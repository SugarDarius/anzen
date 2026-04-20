import { baseUrl } from '~/config/site'

export const revalidate = false

const body = `User-Agent: *
Allow: /
Disallow: /api/
Content-Signal: ai-train=no, search=yes, ai-input=no
Sitemap: ${baseUrl}/sitemap.xml
`

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
