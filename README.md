# Example MCP Server (Streamable HTTP First)

This repo refactors a single-file STDIO MCP server into the recommended modular layout with Streamable HTTP transport as the default.

## Quickstart

```bash
npm install
echo "EXAMPLE_API_KEY=dev" > .env
npm run build
npm start
```

In development (STDIO):
```bash
npm run start:stdio
```

## Client config snippet (dev)
```json
{
  "mcpServers": {
    "example": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

## Endpoints

- `POST /mcp` — Streamable HTTP transport (session-based)
- `GET  /sse` — SSE transport (backward compatibility)
- `GET  /health` — Health check
