import {
  providerCategories,
  publishedProviders,
  type IsoDate,
  type ProviderCategory,
  type ProviderRecord,
} from './records';

export const directoryPath = '/cumpleanos-infantiles-cordoba/';

export function providerPath(provider: ProviderRecord): string {
  return `${directoryPath}proveedores/${provider.slug}/`;
}

export function categoryFilterPath(category: ProviderCategory): string {
  return `${directoryPath}?rubro=${category}`;
}

function categoryMeta(category: ProviderCategory) {
  return providerCategories.find((item) => item.id === category) ?? providerCategories[0];
}

export function categoryLabel(category: ProviderCategory): string {
  return categoryMeta(category).label;
}

export function categorySingular(category: ProviderCategory): string {
  return categoryMeta(category).singular;
}

export function servicesTitle(category: ProviderCategory): string {
  return categoryMeta(category).servicesTitle;
}

export function relatedTitle(category: ProviderCategory): string {
  return categoryMeta(category).relatedTitle;
}

export function isCategory(value: string | null | undefined): value is ProviderCategory {
  return providerCategories.some((item) => item.id === value);
}

export function hasWhatsapp(provider: ProviderRecord): boolean {
  return Boolean(provider.whatsappUrl);
}

/**
 * Conteo por rubro sobre todas las fichas publicadas. No cambia con la búsqueda ni con "Con WhatsApp":
 * el total de resultados es el que refleja todos los filtros juntos.
 */
export function categoryCounts(list: ProviderRecord[]): { id: ProviderCategory; label: string; count: number }[] {
  return providerCategories
    .map((item) => ({ id: item.id, label: item.label, count: list.filter((provider) => provider.categories.includes(item.id)).length }))
    .filter((item) => item.count > 0);
}

export function sortProviders(list: ProviderRecord[]): ProviderRecord[] {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function providersByCategory(category: ProviderCategory, list = publishedProviders()): ProviderRecord[] {
  return sortProviders(list.filter((provider) => provider.categories.includes(category)));
}

export function relatedProviders(provider: ProviderRecord, limit = 3, list = publishedProviders()): ProviderRecord[] {
  return providersByCategory(provider.categories[0], list)
    .filter((item) => item.id !== provider.id)
    .slice(0, limit);
}

export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es').trim();
}

export type DirectoryFilter = {
  query: string;
  category: ProviderCategory | null;
  whatsappOnly: boolean;
};

export function searchText(provider: ProviderRecord): string {
  return normalizeText(
    [
      provider.name,
      provider.neighborhood,
      provider.locality,
      provider.coverage,
      provider.summary,
      ...provider.highlights,
      ...(provider.services ?? []),
      ...provider.categories.map(categoryLabel),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function filterProviders(list: ProviderRecord[], filter: DirectoryFilter): ProviderRecord[] {
  const needle = normalizeText(filter.query);
  return sortProviders(list).filter((provider) => {
    if (needle && !searchText(provider).includes(needle)) return false;
    if (filter.category && !provider.categories.includes(filter.category)) return false;
    if (filter.whatsappOnly && !hasWhatsapp(provider)) return false;
    return true;
  });
}

/** Barrio o ciudad, o la zona de atención publicada. Nunca la dirección completa. */
export function areaLine(provider: ProviderRecord): string {
  if (provider.neighborhood) return `${provider.neighborhood}, ${provider.locality}`;
  if (!provider.address && provider.coverage) return provider.coverage.split('.')[0];
  return provider.locality;
}

export type ProviderFact = { term: string; value: string };

export function providerFacts(provider: ProviderRecord): ProviderFact[] {
  const isVenue = provider.categories.includes('salones');
  const facts: (ProviderFact | null)[] = [
    provider.ageRange ? { term: 'Edades', value: provider.ageRange } : null,
    provider.capacity ? { term: 'Capacidad', value: provider.capacity } : null,
    provider.spaces ? { term: 'Espacios', value: provider.spaces } : null,
    provider.duration ? { term: 'Duración', value: provider.duration } : null,
    provider.openingHours ? { term: isVenue ? 'Horarios de eventos' : 'Horarios', value: provider.openingHours } : null,
    provider.leadTime ? { term: 'Anticipación', value: provider.leadTime } : null,
    provider.delivery ? { term: 'Entrega', value: provider.delivery } : null,
    provider.bookingNote ? { term: isVenue ? 'Visitas' : 'Pedidos', value: provider.bookingNote } : null,
  ];
  return facts.filter((fact): fact is ProviderFact => fact !== null);
}

export type ContactActionType = 'whatsapp' | 'phone' | 'website' | 'social' | 'map';

export type ContactAction = {
  type: ContactActionType;
  label: string;
  href: string;
  detail?: string;
  external: boolean;
};

export function contactActions(provider: ProviderRecord): ContactAction[] {
  const actions: ContactAction[] = [];
  if (provider.whatsappUrl) {
    actions.push({ type: 'whatsapp', label: 'WhatsApp', href: provider.whatsappUrl, external: true });
  }
  if (provider.phoneTel) {
    actions.push({ type: 'phone', label: 'Llamar', href: `tel:${provider.phoneTel}`, detail: provider.phoneDisplay, external: false });
  }
  if (provider.secondaryPhoneTel) {
    actions.push({
      type: 'phone',
      label: 'Llamar al otro número',
      href: `tel:${provider.secondaryPhoneTel}`,
      detail: provider.secondaryPhoneDisplay,
      external: false,
    });
  }
  if (provider.website) {
    actions.push({ type: 'website', label: 'Sitio oficial', href: provider.website, external: true });
  }
  if (provider.socialUrl) {
    const label = provider.socialUrl.includes('instagram.com') ? 'Instagram' : 'Perfil en redes';
    actions.push({ type: 'social', label, href: provider.socialUrl, external: true });
  }
  if (provider.mapUrl) {
    actions.push({ type: 'map', label: 'Cómo llegar', href: provider.mapUrl, external: true });
  }
  return actions;
}

/** WhatsApp si está publicado; si no, el primer teléfono. */
export function primaryContact(provider: ProviderRecord): ContactAction | undefined {
  const actions = contactActions(provider);
  return actions.find((action) => action.type === 'whatsapp') ?? actions.find((action) => action.type === 'phone');
}

const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function formatVerifiedDate(date: IsoDate): string {
  const [year, month, day] = date.split('-').map(Number);
  const monthName = monthNames[month - 1];
  if (!year || !monthName || !day) return date;
  return `${day} de ${monthName} de ${year}`;
}
