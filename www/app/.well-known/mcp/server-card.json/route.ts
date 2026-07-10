import { mcpServerCardJson } from '~/lib/mcp-server-metadata'

export const revalidate = false

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Origin': '*',
} as const

const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
} as const

export function OPTIONS() {
  return new Response(null, {
    headers: { ...corsHeaders },
    status: 204,
  })
}

export function GET() {
  return Response.json(mcpServerCardJson(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...cacheHeaders,
    },
  })
}
