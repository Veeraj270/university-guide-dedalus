import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, InitializedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';
import { AnthropicWebClient } from './client.js';
import { webSearchTool, handleWebSearch } from './tools/index.js';

export function createStandaloneServer(apiKey: string): Server {
  const server = new Server(
    { name: 'org/claude-web-search', version: '0.2.0' },
    { capabilities: { tools: {} } }
  );

  const client = new AnthropicWebClient(apiKey);

  server.setNotificationHandler(InitializedNotificationSchema, async () => {
    console.log('[claude-web-search] MCP client initialized');
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [webSearchTool] }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    switch (name) {
      case 'web_search':
        return handleWebSearch(client, args);
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  });

  return server;
}

export class ExampleServiceServer {
  constructor(private apiKey: string) {}
  getServer(): Server { return createStandaloneServer(this.apiKey); }
}
