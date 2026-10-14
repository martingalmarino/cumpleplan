import { describe, expect, it } from 'vitest';
import { providers, publishedProviders, type ProviderRecord } from '../src/data/providers/records';
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
  providerFacts,
  providersByCategory,
  relatedProviders,
} from '../src/data/providers/selectors';

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

  it('ordena WhatsApp, llamar, sitio, perfil y mapa', () => {
    expect(contactActions(full).map((action) => action.type)).toEqual(['whatsapp', 'phone', 'website', 'social', 'map']);
    expect(contactActions(full).at(-1)?.label).toBe('Cómo llegar');
  });

  it('omite lo que el proveedor no publica', () => {
    const minimal = { ...full, whatsappUrl: undefined, socialUrl: undefined, mapUrl: undefined };
    expect(contactActions(minimal).map((action) => action.type)).toEqual(['phone', 'website']);
  });

  it('arma el enlace tel con el número internacional', () => {
    expect(contactActions(full).find((action) => action.type === 'phone')?.href).toBe('tel:+543510000000');
  });

  it('prioriza WhatsApp y si no hay, el teléfono', () => {
    expect(primaryContact(full)?.type).toBe('whatsapp');
    expect(primaryContact({ ...full, whatsappUrl: undefined })?.type).toBe('phone');
    expect(primaryContact({ ...full, phoneTel: undefined, phoneDisplay: undefined })?.type).toBe('whatsapp');
    expect(primaryContact({ ...full, whatsappUrl: undefined, phoneTel: undefined })).toBeUndefined();
  });
});

describe('filtros del directorio', () => {
  const list = [
    fixture({ id: 'a', slug: 'a', name: 'Salón Peñón', categories: ['salones'], neighborhood: 'Barrio Jardín', whatsappUrl: 'https://wa.me/5493510000001' }),
    fixture({ id: 'b', slug: 'b', name: 'Animaciones Árbol', categories: ['animacion'], neighborhood: undefined, whatsappUrl: undefined }),
    fixture({ id: 'c', slug: 'c', name: 'Casa Globo', categories: ['salones', 'decoracion'], neighborhood: 'Centro', whatsappUrl: undefined }),
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

  it('arma la URL de filtro por rubro', () => {
    expect(categoryFilterPath('salones')).toBe('/cumpleanos-infantiles-cordoba/?rubro=salones');
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

  it('solo publica fichas no destacadas', () => {
    expect(publishedProviders().every((provider) => provider.publicationStatus === 'published' && !provider.featured)).toBe(true);
  });
});
