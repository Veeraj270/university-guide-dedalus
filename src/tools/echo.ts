import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ExampleServiceClient } from '../client.js';
import { isEchoArgs } from '../types.js';

export const echoTool: Tool = {
  name: 'example_echo',
  description: 'Echoes text back to the caller. Demo tool skeleton.',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to echo' },
      uppercase: { type: 'boolean', description: 'Uppercase the text' }
    },
    required: ['text'],
    additionalProperties: false
  }
};

export async function handleEcho(client: ExampleServiceClient, args: unknown): Promise<CallToolResult> {
  try {
    if (!isEchoArgs(args)) throw new Error('Invalid arguments for example_echo');
    const result = await client.echo(args);
    return { content: [{ type: 'text', text: result }], isError: false };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
  }
}
