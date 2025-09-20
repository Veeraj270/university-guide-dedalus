export interface WebSearchArgs {
  query: string;
  maxResults?: number;
  allowedDomains?: string[];
  blockedDomains?: string[];
}

export function isWebSearchArgs(x: unknown): x is WebSearchArgs {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  const okQuery = typeof o.query === 'string' && o.query.length > 0;
  const okMax = o.maxResults === undefined || typeof o.maxResults === 'number';
  const okAllow = o.allowedDomains === undefined || Array.isArray(o.allowedDomains);
  const okBlock = o.blockedDomains === undefined || Array.isArray(o.blockedDomains);
  return okQuery && okMax && okAllow && okBlock;
}
