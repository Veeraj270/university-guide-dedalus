import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

export async function runStdioTransport(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  try { await server.connect(transport); console.error('[example] MCP Server running on stdio'); }
  catch (e) { console.error('Failed to start STDIO transport:', e); throw e; }
}
