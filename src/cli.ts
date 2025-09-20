    export interface CliOptions { port?: number; stdio?: boolean; }

    export function parseArgs(): CliOptions {
      const args = process.argv.slice(2);
      const opts: CliOptions = {};
      for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
          case '--port':
            if (i + 1 >= args.length) throw new Error('--port flag requires a value');
            opts.port = parseInt(args[++i], 10);
            break;
          case '--stdio':
            opts.stdio = true;
            break;
          case '--help':
            printHelp();
            process.exit(0);
        }
      }
      return opts;
    }

    function printHelp() {
      console.log(`
Example MCP Server

USAGE:
  example-mcp [OPTIONS]

OPTIONS:
  --port <PORT>    Run HTTP server on specified port (default: 8080)
  --stdio          Use STDIO transport instead of HTTP
  --help           Print this help message

ENVIRONMENT VARIABLES:
  EXAMPLE_API_KEY  Required: Your API key for outbound requests (if used)
  PORT             HTTP server port (default: 8080)
  NODE_ENV         Set to 'production' for production mode
`);
    }
