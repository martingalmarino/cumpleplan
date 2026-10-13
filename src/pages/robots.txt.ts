import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (site.origin && site.allowIndexing) {
    lines.push('', `Sitemap: ${site.origin}/sitemap.xml`);
  }
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
