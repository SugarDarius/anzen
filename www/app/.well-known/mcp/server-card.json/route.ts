import { mcpServerCardJson } from '~/lib/mcp-server-metadata'

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

export function GET() {
  return new Response(JSON.stringify(mcpServerCardJson()), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...cacheHeaders,
    },
  })
}
