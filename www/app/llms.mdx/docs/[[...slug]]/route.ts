import { notFound } from 'next/navigation'

import { getLLMText } from '~/lib/get-llm-text'
import { source } from '~/lib/source'

export const revalidate = false

export function generateStaticParams() {
  return source.generateParams()
}

export async function GET(
  _req: Request,
  { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>,
) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) {
    notFound()
  }

  const text = await getLLMText(page)
  return new Response(text, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
