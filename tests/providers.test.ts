import { describe, expect, it } from 'vitest';
import { providers, publishedProviders, type ProviderRecord, type ProviderCategory } from '../src/data/providers/records';
import {
  areaLine,
  categoryCounts,
  categoryFilterPath,
  categoryLabel,
  contactActions,
  filterProviders,
  formatVerifiedDate,
  normalizeText,
  primaryContact,
  providerDescription,
  providerFacts,
  providerTitle,
  providersByCategory,
  relatedProviders,
} from '../src/data/providers/selectors';
import {
  slugify,
  provinceSlug,
  citySlug,
  categorySlug,
  hasSlugCollision,
  isIndexable,
  INDEXABLE_THRESHOLD,
  providerPath,
  directoryProvincePath,
  directoryProvinceRubroPath,
  directoryProvinceCityPath,
  directoryProvinceCityRubroPath,
} from '../src/data/providers/routes';
import { generateDirectoryRoutes } from '../src/data/providers/groups';

const base = providers[0];

function fixture(overrides: Partial<ProviderRecord>): ProviderRecord {
  return { ...base, publicationStatus: 'published', featured: false, ...overrides };
}

describe('fichas de proveedores', () => {
  it('tienen slugs e ids únicos', () => {
    expect(new Set(providers.map((provider) => provider.slug)).size).toBe(providers.length);
    expect(new Set(providers.map((provider) => provider.id)).size).toBe(providers.length);
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s tiene contacto, fuente y fecha válidos', (_, provider) => {
    expect(contactActions(provider).length).toBeGreaterThan(0);
    expect(primaryContact(provider)).toBeDefined();
    expect(provider.sources.length).toBeGreaterThan(0);
    for (const source of provider.sources) expect(source.url).toMatch(/^https:\/\//);
    expect(provider.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(provider.featured).toBe(false);
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s usa teléfonos y WhatsApp con formato argentino', (_, provider) => {
    for (const tel of [provider.phoneTel, provider.secondaryPhoneTel]) {
      if (tel) expect(tel).toMatch(/^\+54\d{8,12}$/);
    }
    if (provider.whatsappUrl) expect(provider.whatsappUrl).toMatch(/^https:\/\/wa\.me\/54\d{8,12}$/);
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s tiene resumen corto y hasta 3 datos destacados', (_, provider) => {
    expect(provider.summary.length).toBeGreaterThan(0);
    expect(provider.summary.length).toBeLessThanOrEqual(120);
    expect(provider.description.length).toBeGreaterThan(0);
    expect(provider.highlights.length).toBeLessThanOrEqual(3);
    if (provider.services) expect(provider.services.length).toBeGreaterThan(0);
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s no inventa fotos', (_, provider) => {
    for (const image of provider.images ?? []) {
      expect(image.alt.length).toBeGreaterThan(0);
      expect(image.credit.length).toBeGreaterThan(0);
    }
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s tiene enlaces con formato válido', (_, provider) => {
    for (const url of [provider.website, provider.socialUrl, ...provider.sources.map((source) => source.url)]) {
      if (url) expect(() => new URL(url)).not.toThrow();
      if (url) expect(url).toMatch(/^https:\/\//);
    }
    if (provider.mapUrl) expect(provider.mapUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^&\s]+$/);
    if (provider.email) expect(provider.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/);
    for (const source of provider.sources) {
      if (source.reviewedAt) expect(source.reviewedAt <= provider.verifiedAt).toBe(true);
    }
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s tiene título y descripción cortos', (_, provider) => {
    expect(providerTitle(provider).length).toBeLessThanOrEqual(60);
    expect(providerDescription(provider).length).toBeLessThanOrEqual(160);
  });

  it('no repite títulos ni sedes', () => {
    const titles = providers.map(providerTitle);
    expect(new Set(titles).size).toBe(titles.length);
    const places = providers.map((provider) => `${normalizeText(provider.name)}|${normalizeText(provider.address ?? provider.id)}`);
    expect(new Set(places).size).toBe(places.length);
    const addresses = providers.filter((provider) => provider.address).map((provider) => normalizeText(provider.address!));
    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it('no publica candidatos descartados en la investigación', () => {
    const names = providers.map((provider) => normalizeText(provider.name));
    for (const excluded of ['candy laser', 'funfestcba', 'kidcity', 'tucan']) {
      expect(names.some((name) => name.includes(excluded))).toBe(false);
    }
  });

  it('Cocoliche ofrece WhatsApp y no un botón de llamada', () => {
    const cocoliche = providers.find((provider) => provider.slug === 'cocoliche')!;
    expect(primaryContact(cocoliche)?.type).toBe('whatsapp');
    expect(contactActions(cocoliche).some((action) => action.type === 'phone')).toBe(false);
  });
});

describe('contactActions', () => {
  const full = fixture({
    website: 'https://ejemplo.com.ar/',
    socialUrl: 'https://www.instagram.com/ejemplo/',
    phoneTel: '+543510000000',
    phoneDisplay: '351 000-0000',
    secondaryPhoneTel: undefined,
    whatsappUrl: 'https://wa.me/5493510000000',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ejemplo',
  });

  it('ordena WhatsApp, llamar, sitio, perfil, correo y mapa', () => {
    const withEmail = { ...full, email: 'hola@ejemplo.com.ar' };
    expect(contactActions(withEmail).map((action) => action.type)).toEqual(['whatsapp', 'phone', 'website', 'social', 'email', 'map']);
    expect(contactActions(withEmail).at(-1)?.label).toBe('Buscar dirección en el mapa');
  });

  it('omite lo que el proveedor no publica', () => {
    const minimal = { ...full, whatsappUrl: undefined, socialUrl: undefined, mapUrl: undefined, email: undefined };
    expect(contactActions(minimal).map((action) => action.type)).toEqual(['phone', 'website']);
  });

  it('si solo hay una red oficial, invita a consultar ahí', () => {
    const socialOnly = fixture({
      whatsappUrl: undefined,
      phoneTel: undefined,
      phoneDisplay: undefined,
      secondaryPhoneTel: undefined,
      secondaryPhoneDisplay: undefined,
      socialUrl: 'https://www.facebook.com/ejemplo/',
    });
    expect(primaryContact(socialOnly)?.label).toBe('Consultar en Facebook');
  });

  it('arma el enlace tel con el número internacional', () => {
    expect(contactActions(full).find((action) => action.type === 'phone')?.href).toBe('tel:+543510000000');
  });

  it('prioriza WhatsApp y si no hay, el teléfono', () => {
    expect(primaryContact(full)?.type).toBe('whatsapp');
    expect(primaryContact({ ...full, whatsappUrl: undefined })?.type).toBe('phone');
    expect(primaryContact({ ...full, phoneTel: undefined, phoneDisplay: undefined })?.type).toBe('whatsapp');
    expect(primaryContact({ ...full, whatsappUrl: undefined, phoneTel: undefined })?.label).toBe('Consultar en Instagram');
    expect(primaryContact({ ...full, whatsappUrl: undefined, phoneTel: undefined, socialUrl: undefined })).toBeUndefined();
  });
});

describe('filtros del directorio', () => {
  const neutral = { summary: 'Ficha de prueba.', highlights: [], services: undefined, coverage: undefined };
  const list = [
    fixture({ ...neutral, id: 'a', slug: 'a', name: 'Salón Peñón', categories: ['salones'], neighborhood: 'Barrio Jardín', whatsappUrl: 'https://wa.me/5493510000001' }),
    fixture({ ...neutral, id: 'b', slug: 'b', name: 'Animaciones Árbol', categories: ['animacion'], neighborhood: undefined, whatsappUrl: undefined }),
    fixture({ ...neutral, id: 'c', slug: 'c', name: 'Casa Globo', categories: ['salones', 'decoracion'], neighborhood: 'Centro', whatsappUrl: undefined }),
  ];

  it('ignora mayúsculas y acentos', () => {
    expect(normalizeText('  Salón PEÑÓN ')).toBe('salon penon');
    expect(filterProviders(list, { query: 'penon', category: null, whatsappOnly: false }).map((p) => p.id)).toEqual(['a']);
    expect(filterProviders(list, { query: 'ARBOL', category: null, whatsappOnly: false }).map((p) => p.id)).toEqual(['b']);
    expect(filterProviders(list, { query: 'jardin', category: null, whatsappOnly: false }).map((p) => p.id)).toEqual(['a']);
  });

  it('combina búsqueda, rubro y WhatsApp con Y', () => {
    expect(filterProviders(list, { query: '', category: 'salones', whatsappOnly: false }).map((p) => p.id)).toEqual(['c', 'a']);
    expect(filterProviders(list, { query: '', category: 'salones', whatsappOnly: true }).map((p) => p.id)).toEqual(['a']);
    expect(filterProviders(list, { query: 'globo', category: 'salones', whatsappOnly: true })).toEqual([]);
  });

  it('busca también por nombre de rubro', () => {
    expect(filterProviders(list, { query: 'decoracion', category: null, whatsappOnly: false }).map((p) => p.id)).toEqual(['c']);
  });

  it('cuenta rubros sobre todas las fichas y oculta los vacíos', () => {
    expect(categoryCounts(list)).toEqual([
      { id: 'salones', label: 'Salones', count: 2 },
      { id: 'animacion', label: 'Animación', count: 1 },
      { id: 'decoracion', label: 'Decoración y alquileres', count: 1 },
    ]);
  });

  it('arma la URL deprecated de filtro por rubro', () => {
    expect(categoryFilterPath('salones')).toBe('/directorio/cordoba/cordoba-capital/salones-infantiles/');
  });
});

describe('textos de la ficha', () => {
  it('usa barrio y ciudad, o la zona si no hay dirección', () => {
    expect(areaLine(fixture({ neighborhood: 'Centro', locality: 'Córdoba Capital' }))).toBe('Centro, Córdoba Capital');
    expect(
      areaLine(fixture({ neighborhood: undefined, address: undefined, coverage: 'Todos los barrios de Córdoba. Sin envíos afuera.' })),
    ).toBe('Todos los barrios de Córdoba');
    expect(areaLine(fixture({ neighborhood: undefined, address: 'Calle 1', locality: 'Córdoba Capital' }))).toBe('Córdoba Capital');
  });

  it('muestra solo los datos que existen, sin rubro, ciudad ni fecha', () => {
    const facts = providerFacts(
      fixture({
        categories: ['tortas-catering'],
        ageRange: undefined,
        capacity: undefined,
        spaces: undefined,
        duration: undefined,
        openingHours: undefined,
        leadTime: '72 h',
        delivery: undefined,
        bookingNote: undefined,
      }),
    );
    expect(facts).toEqual([{ term: 'Anticipación', value: '72 h' }]);
    const terms = providerFacts(base).map((fact) => fact.term);
    for (const forbidden of ['Rubro', 'Ciudad', 'Revisado']) expect(terms).not.toContain(forbidden);
  });
});

describe('helpers del directorio', () => {
  it('formatea la fecha de revisión en castellano', () => {
    expect(formatVerifiedDate('2026-10-13')).toBe('13 de octubre de 2026');
    expect(formatVerifiedDate('2027-01-05')).toBe('5 de enero de 2027');
  });

  it('traduce el rubro', () => {
    expect(categoryLabel('tortas-catering')).toBe('Tortas y catering');
  });

  it('filtra por rubro en orden alfabético', () => {
    const salones = providersByCategory('salones');
    expect(salones.length).toBeGreaterThan(0);
    expect(salones.every((provider) => provider.categories.includes('salones'))).toBe(true);
    const names = salones.map((provider) => provider.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')));
  });

  it('relacionados excluyen la ficha actual y pueden quedar vacíos', () => {
    const salon = providersByCategory('salones')[0];
    expect(relatedProviders(salon).some((item) => item.id === salon.id)).toBe(false);
    expect(relatedProviders(salon, 3, [salon])).toEqual([]);
  });

  it('relacionados muestran primero las otras sedes de la misma marca', () => {
    const vr = providers.find((provider) => provider.slug === 'candy-vr')!;
    expect(relatedProviders(vr)[0].slug).toBe('candy-jump');
    const aventura = providers.find((provider) => provider.slug === 'espacio-aventura-pueyrredon')!;
    expect(relatedProviders(aventura)[0].slug).toBe('espacio-aventura-alta-cordoba');
  });

  it('solo publica fichas no destacadas', () => {
    expect(publishedProviders().every((provider) => provider.publicationStatus === 'published' && !provider.featured)).toBe(true);
  });
});

describe('rutas del directorio', () => {
  it('genera slugs sin acentos ni mayúsculas', () => {
    expect(slugify('Córdoba Capital')).toBe('cordoba-capital');
    expect(slugify('Buenos Aires')).toBe('buenos-aires');
    expect(slugify('Salones Infantiles')).toBe('salones-infantiles');
  });

  it('genera rutas de provincia', () => {
    expect(provinceSlug('Córdoba')).toBe('cordoba');
    expect(directoryProvincePath('Córdoba')).toBe('/directorio/cordoba/');
  });

  it('genera rutas de ciudad', () => {
    expect(citySlug('Córdoba Capital')).toBe('cordoba-capital');
    expect(directoryProvinceCityPath('Córdoba', 'Córdoba Capital')).toBe('/directorio/cordoba/cordoba-capital/');
  });

  it('genera rutas de categoría con slug correcto', () => {
    expect(categorySlug('salones')).toBe('salones-infantiles');
    expect(categorySlug('tortas-catering')).toBe('tortas-y-catering');
    expect(directoryProvinceRubroPath('Córdoba', 'salones')).toBe('/directorio/cordoba/salones-infantiles/');
  });

  it('genera rutas de ciudad + categoría', () => {
    expect(directoryProvinceCityRubroPath('Córdoba', 'Córdoba Capital', 'tortas-catering')).toBe('/directorio/cordoba/cordoba-capital/tortas-y-catering/');
  });

  it('genera ruta de proveedor', () => {
    const provider = publishedProviders()[0];
    expect(providerPath(provider)).toBe(`/proveedor/${provider.slug}/`);
  });

  it('detecta colisión entre slug de ciudad y rubro', () => {
    expect(hasSlugCollision(['Animación'], ['animacion'])).toBe(true);
    expect(hasSlugCollision(['Córdoba Capital'], ['salones'])).toBe(false);
  });

  it('aplica threshold de 3 proveedores para páginas indexables', () => {
    expect(INDEXABLE_THRESHOLD).toBe(3);
    expect(isIndexable(2)).toBe(false);
    expect(isIndexable(3)).toBe(true);
    expect(isIndexable(10)).toBe(true);
  });

  it('genera solo rutas indexables en el directorio', () => {
    const routes = generateDirectoryRoutes();
    expect(routes.length).toBeGreaterThan(0);
    
    // Todas las rutas marcadas como indexables deben tener >= 3 proveedores
    for (const route of routes) {
      if (route.indexable) {
        expect(route.count).toBeGreaterThanOrEqual(INDEXABLE_THRESHOLD);
      } else {
        expect(route.count).toBeLessThan(INDEXABLE_THRESHOLD);
      }
    }
    
    // El índice nacional debe estar presente
    expect(routes.some((r) => r.path === '/directorio/')).toBe(true);
  });

  it('no genera colisiones de slugs en las rutas reales', () => {
    const allProviders = publishedProviders();
    const cities = [...new Set(allProviders.map((p) => p.city))];
    const categories: ProviderCategory[] = ['salones', 'animacion', 'tortas-catering', 'decoracion'];
    
    expect(hasSlugCollision(cities, categories)).toBe(false);
  });
});
