import { mcpInitializeResult } from '~/lib/mcp-server-metadata'

type JsonRpcId = string | number | null

interface JsonRpcRequest {
  jsonrpc?: string
  id?: JsonRpcId
  method?: string
  params?: unknown
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: JsonRpcId
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
} as const

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...init?.headers,
    },
  })
}

function handleOne(req: JsonRpcRequest): JsonRpcResponse | null {
  const { id, method } = req
  if (method === undefined) {
    return id !== undefined && id !== null
      ? {
          error: { code: -32_600, message: 'Invalid Request' },
          id,
          jsonrpc: '2.0',
        }
      : null
  }
  if (id === undefined || id === null) {
    return null
  }
  if (method === 'initialize') {
    return {
      id,
      jsonrpc: '2.0',
      result: mcpInitializeResult(),
    }
  }
  if (method === 'ping') {
    return { id, jsonrpc: '2.0', result: {} }
  }
  if (method === 'tools/list') {
    return { id, jsonrpc: '2.0', result: { tools: [] } }
  }
  if (method === 'resources/list') {
    return { id, jsonrpc: '2.0', result: { resources: [] } }
  }
  if (method === 'prompts/list') {
    return { id, jsonrpc: '2.0', result: { prompts: [] } }
  }
  return {
    error: { code: -32_601, message: `Method not found: ${method}` },
    id,
    jsonrpc: '2.0',
  }
}

export function OPTIONS() {
  return new Response(null, { headers: { ...corsHeaders }, status: 204 })
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      {
        error: { code: -32_700, message: 'Parse error' },
        id: null,
        jsonrpc: '2.0',
      },
      { status: 400 },
    )
  }

  const sessionId = crypto.randomUUID()
  const headerSession = { 'Mcp-Session-Id': sessionId }

  if (Array.isArray(payload)) {
    const out: JsonRpcResponse[] = []
    for (const item of payload) {
      const res = handleOne(item as JsonRpcRequest)
      if (res) {
        out.push(res)
      }
    }
    return jsonResponse(out, { headers: headerSession })
  }

  const single = handleOne(payload as JsonRpcRequest)
  if (single === null) {
    return new Response(null, {
      headers: { ...corsHeaders, ...headerSession },
      status: 202,
    })
  }
  return jsonResponse(single, { headers: headerSession })
}
