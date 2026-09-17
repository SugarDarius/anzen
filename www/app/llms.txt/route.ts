import { llms } from 'fumadocs-core/source'

import { source } from '~/lib/source'

export const revalidate = false

export async function GET() {
  const content = await llms(source).index()
  return new Response(content)
}
