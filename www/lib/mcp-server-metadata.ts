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
  tools: { listChanged: false as const },
  resources: {},
  prompts: {},
} as const

const transportEndpoint = '/mcp'

export function mcpServerCardJson() {
  return {
    $schema: MCP_CARD_SCHEMA,
    version: '1.0',
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: { ...MCP_SERVER_INFO },
    description: siteConfig.description,
    documentationUrl: new URL('/docs', baseUrl).toString(),
    transport: {
      type: 'streamable-http',
      endpoint: transportEndpoint,
    },
    capabilities: {
      tools: { ...MCP_CAPABILITIES.tools },
      resources: { ...MCP_CAPABILITIES.resources },
      prompts: { ...MCP_CAPABILITIES.prompts },
    },
  }
}

export function mcpInitializeResult() {
  return {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: {
      tools: { ...MCP_CAPABILITIES.tools },
      resources: { ...MCP_CAPABILITIES.resources },
      prompts: { ...MCP_CAPABILITIES.prompts },
    },
    serverInfo: { ...MCP_SERVER_INFO },
  }
}
