import { createServer, IncomingMessage, ServerResponse } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { randomUUID } from 'crypto';
import { createStandaloneServer } from '../server.js';
import type { Config } from '../config.js';

const sessions = new Map<string, { transport: StreamableHTTPServerTransport }>();

export function startHttpTransport(config: Config): void {
  const httpServer = createServer();

  httpServer.on('request', (req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    if (url.pathname === '/mcp') return void handleMcp(req, res, config);
    if (url.pathname === '/sse') return void handleSse(req, res, config);
    if (url.pathname === '/health') return void ok(res);
    notFound(res);
  });

  const host = config.isProduction ? '0.0.0.0' : 'localhost';
  httpServer.listen(config.port, host, () => logStart(config));
}

async function handleMcp(req: IncomingMessage, res: ServerResponse, config: Config) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (sessionId) {
    const s = sessions.get(sessionId);
    if (!s) { res.statusCode = 404; res.end('Session not found'); return; }
    return s.transport.handleRequest(req, res);
  }

  if (req.method !== 'POST') { res.statusCode = 400; res.end('Invalid request'); return; }

  const server = createStandaloneServer(config.apiKey);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => { sessions.set(id, { transport }); console.log('[example] New session:', id); },
  });

  transport.onclose = () => { if (transport.sessionId) { sessions.delete(transport.sessionId); console.log('[example] Session closed:', transport.sessionId); } };

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (e) {
    console.error('HTTP transport error:', e);
    res.statusCode = 500; res.end('Internal server error');
  }
}

async function handleSse(_req: IncomingMessage, res: ServerResponse, config: Config) {
  const server = createStandaloneServer(config.apiKey);
  const transport = new SSEServerTransport('/sse', res);
  try { await server.connect(transport); console.log('[example] SSE connected'); }
  catch (e) { console.error('SSE error:', e); res.statusCode = 500; res.end('SSE connection failed'); }
}

function ok(res: ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString(), service: 'example-mcp', version: '0.2.0' }));
}

function notFound(res: ServerResponse) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not Found'); }

function logStart(config: Config) {
  const display = config.isProduction ? `Port ${config.port}` : `http://localhost:${config.port}`;
  console.log(`[example] MCP Server listening on ${display}`);
  if (!config.isProduction) {
    console.log('Client config snippet:');
    console.log(JSON.stringify({ mcpServers: { 'example': { url: `http://localhost:${config.port}/mcp` } } }, null, 2));
    console.log('For backward compatibility, /sse is available.');
  }
}
