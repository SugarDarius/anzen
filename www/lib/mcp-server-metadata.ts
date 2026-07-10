import { baseUrl, siteConfig } from '~/config/site'

/** MCP Server Card + initialize result (SEP-1649 draft). */
export const MCP_CARD_SCHEMA =
  'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json' as const

export const MCP_PROTOCOL_VERSION = '2025-06-18' as const

export const MCP_SERVER_INFO = {
  name: 'anzen-docs',
  title: siteConfig.title,
  version: '0.1.0',
} as const

export const MCP_CAPABILITIES = {
  prompts: {},
  resources: {},
  tools: { listChanged: false as const },
} as const

const transportEndpoint = '/mcp'

export function mcpServerCardJson() {
  return {
    $schema: MCP_CARD_SCHEMA,
    capabilities: {
      prompts: { ...MCP_CAPABILITIES.prompts },
      resources: { ...MCP_CAPABILITIES.resources },
      tools: { ...MCP_CAPABILITIES.tools },
    },
    description: siteConfig.description,
    documentationUrl: new URL('/docs', baseUrl).toString(),
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: { ...MCP_SERVER_INFO },
    transport: {
      endpoint: transportEndpoint,
      type: 'streamable-http',
    },
    version: '1.0',
  }
}

export function mcpInitializeResult() {
  return {
    capabilities: {
      prompts: { ...MCP_CAPABILITIES.prompts },
      resources: { ...MCP_CAPABILITIES.resources },
      tools: { ...MCP_CAPABILITIES.tools },
    },
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: { ...MCP_SERVER_INFO },
  }
}
