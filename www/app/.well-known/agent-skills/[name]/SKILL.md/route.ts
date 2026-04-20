import { getSkillMarkdown } from '~/lib/agent-skills'

export const revalidate = false

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const

const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
} as const

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...corsHeaders },
  })
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params
  const body = getSkillMarkdown(name)
  if (!body) {
    return new Response('Not Found', {
      status: 404,
      headers: { ...corsHeaders },
    })
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders,
      ...cacheHeaders,
    },
  })
}
