import { describe, expect, it } from 'vitest';
import {
  categoryLabel,
  contactActions,
  formatVerifiedDate,
  providers,
  providersByCategory,
  publishedProviders,
  type ProviderRecord,
} from '../src/data/providers/records';

describe('fichas de proveedores', () => {
  it('tienen slugs e ids únicos', () => {
    expect(new Set(providers.map((provider) => provider.slug)).size).toBe(providers.length);
    expect(new Set(providers.map((provider) => provider.id)).size).toBe(providers.length);
  });

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s tiene contacto, fuente y fecha válidos', (_, provider) => {
    expect(contactActions(provider).length).toBeGreaterThan(0);
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

  it.each(providers.map((provider) => [provider.name, provider] as const))('%s tiene un resumen corto', (_, provider) => {
    if (provider.summary) expect(provider.summary.length).toBeLessThanOrEqual(120);
    if (provider.services) expect(provider.services.length).toBeGreaterThan(0);
  });
});

describe('contactActions', () => {
  const full: ProviderRecord = {
    ...providers[0],
    website: 'https://ejemplo.com.ar/',
    socialUrl: 'https://www.instagram.com/ejemplo/',
    phoneTel: '+543510000000',
    phoneDisplay: '351 000-0000',
    secondaryPhoneTel: undefined,
    whatsappUrl: 'https://wa.me/5493510000000',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ejemplo',
  };

  it('ordena WhatsApp, llamar, sitio, perfil y mapa', () => {
    expect(contactActions(full).map((action) => action.type)).toEqual(['whatsapp', 'phone', 'website', 'social', 'map']);
  });

  it('omite lo que el proveedor no publica', () => {
    const minimal = { ...full, whatsappUrl: undefined, socialUrl: undefined, mapUrl: undefined };
    expect(contactActions(minimal).map((action) => action.type)).toEqual(['phone', 'website']);
  });

  it('arma el enlace tel con el número internacional', () => {
    expect(contactActions(full).find((action) => action.type === 'phone')?.href).toBe('tel:+543510000000');
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

  it('solo publica fichas no destacadas', () => {
    expect(publishedProviders().every((provider) => provider.publicationStatus === 'published' && !provider.featured)).toBe(true);
  });
});
