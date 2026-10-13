import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../config/site';
import { publishedProviders } from '../data/providers/records';

export const GET: APIRoute = async () => {
  const paths: string[] = [];
  if (site.allowIndexing && site.origin) {
    paths.push(
      '/',
      '/calculadora-comida-cumpleanos/',
      '/presupuesto-cumpleanos/',
      '/checklist-cumpleanos/',
      '/lista-compras-cumpleanos/',
      '/guias/',
      '/sobre-el-proyecto/',
      '/contacto/',
      '/privacidad/',
      '/terminos/',
    );
    if (publishedProviders().length > 0) {
      paths.push('/cumpleanos-infantiles-cordoba/');
      for (const provider of publishedProviders()) {
        paths.push(`/cumpleanos-infantiles-cordoba/proveedores/${provider.slug}/`);
      }
    }
    const guides = await getCollection('guias');
    for (const guide of guides) paths.push(`/guias/${guide.id}/`);
  }
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${site.origin}${path}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
