import { mcpInitializeResult } from '~/lib/mcp-server-metadata'

type JsonRpcId = string | number | null

type JsonRpcRequest = {
  jsonrpc?: string
  id?: JsonRpcId
  method?: string
  params?: unknown
}

type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: JsonRpcId
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
} as const

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  })
}

function handleOne(req: JsonRpcRequest): JsonRpcResponse | null {
  const { id, method } = req
  if (method === undefined) {
    return id !== undefined && id !== null
      ? {
          jsonrpc: '2.0',
          id,
          error: { code: -32600, message: 'Invalid Request' },
        }
      : null
  }
  if (id === undefined || id === null) {
    return null
  }
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: mcpInitializeResult(),
    }
  }
  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} }
  }
  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: [] } }
  }
  if (method === 'resources/list') {
    return { jsonrpc: '2.0', id, result: { resources: [] } }
  }
  if (method === 'prompts/list') {
    return { jsonrpc: '2.0', id, result: { prompts: [] } }
  }
  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...corsHeaders } })
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
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
      if (res) out.push(res)
    }
    return jsonResponse(out, { headers: headerSession })
  }

  const single = handleOne(payload as JsonRpcRequest)
  if (single === null) {
    return new Response(null, {
      status: 202,
      headers: { ...corsHeaders, ...headerSession },
    })
  }
  return jsonResponse(single, { headers: headerSession })
}
