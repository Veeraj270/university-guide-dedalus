import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AnthropicWebClient } from '../client.js';
import { isWebSearchArgs } from '../types.js';

export const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Searches the web via Claude’s built-in web_search tool and returns formatted results.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query to look up' },
      maxResults: { type: 'number', description: 'Maximum results to include (default: 5)' },
      allowedDomains: { type: 'array', items: { type: 'string' }, description: 'Restrict results to these domains' },
      blockedDomains: { type: 'array', items: { type: 'string' }, description: 'Exclude results from these domains' }
    },
    required: ['query'],
    additionalProperties: false
  }
};

export async function handleWebSearch(client: AnthropicWebClient, args: unknown): Promise<CallToolResult> {
  try {
    if (!isWebSearchArgs(args)) throw new Error('Invalid arguments for web_search');
    const text = await client.webSearch(args);
    return { content: [{ type: 'text', text }], isError: false };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
  }
}
