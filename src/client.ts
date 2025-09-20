import { Anthropic } from '@anthropic-ai/sdk';

export class AnthropicWebClient {
  private anthropic: Anthropic;
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Performs a Claude message call with the built-in web_search tool.
   * Mirrors the original single-file implementation but wrapped for modular architecture.
   */
  async webSearch(params: { 
    query: string; 
    maxResults?: number; 
    allowedDomains?: string[]; 
    blockedDomains?: string[];
  }): Promise<string> {
    const { query, maxResults = 5, allowedDomains, blockedDomains } = params;

    // Construct the web_search tool schema
    const webSearchTool: any = {
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: maxResults
    };
    if (allowedDomains && allowedDomains.length > 0) {
      webSearchTool.allowed_domains = allowedDomains;
    }
    if (blockedDomains && blockedDomains.length > 0) {
      webSearchTool.blocked_domains = blockedDomains;
    }

    // Create a Claude message requesting the tool
    const response: any = await this.anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: query }
      ],
      // Provide the tool definition so the model can invoke it
      // @ts-ignore - allowed by Anthropic SDK even if types lag built-in tools
      tools: [webSearchTool]
    } as any);

    // Best-effort formatting: extract text parts and any tool-use outputs if present
    let textParts: string[] = [];
    const results: Array<{title?: string; url?: string; snippet?: string}> = [];

    const content = response?.content ?? [];
    for (const part of content) {
      if (part.type === 'text' && typeof part.text === 'string') {
        textParts.push(part.text);
      }
      if (part.type === 'tool_use' && part.name === 'web_search') {
        const toolOutput = part?.input ?? part?.output ?? part;
        // try common fields
        const items = toolOutput?.results || toolOutput?.items || [];
        for (const it of items) {
          results.push({
            title: it.title || it.name,
            url: it.url || it.link,
            snippet: it.snippet || it.description
          });
        }
      }
    }

    const lines: string[] = [];
    if (results.length) {
      lines.push('Search results:');
      results.slice(0, maxResults).forEach((r, i) => {
        lines.push(`${i+1}. ${r.title || 'Untitled'}${r.url ? ' — ' + r.url : ''}`);
        if (r.snippet) lines.push(`   ${r.snippet}`);
      });
    }
    if (textParts.length) {
      lines.push('', 'Model summary:', ...textParts);
    }
    if (!lines.length) {
      // Fallback: return raw JSON so the caller still gets value
      return JSON.stringify(response, null, 2);
    }
    return lines.join('\n');
  }
}
