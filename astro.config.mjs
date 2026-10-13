import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const rawSite = process.env.PUBLIC_SITE_URL?.trim() ?? '';
let site;
if (rawSite) {
  try {
    const url = new URL(rawSite);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      site = url.origin;
    }
  } catch {
    site = undefined;
  }
}

if (process.env.PUBLIC_ALLOW_INDEXING === 'true' && !site) {
  console.warn(
    '[cumple-en-orden] PUBLIC_ALLOW_INDEXING está en true, pero PUBLIC_SITE_URL no es un origen válido. El sitio se genera con noindex.',
  );
}

export default defineConfig({
  site,
  integrations: [react()],
});
