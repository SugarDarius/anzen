import { source } from '~/lib/source'
import { getLLMText } from '~/lib/get-llm-text'

export const revalidate = false

export async function GET() {
  const scan = source.getPages().map(getLLMText)
  const scanned = await Promise.all(scan)

  const text = scanned.join('\n\n')
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
