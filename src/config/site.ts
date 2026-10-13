/**
 * El consentimiento no está implementado.
 * No lo actives con un banner decorativo: AdSense y la analítica
 * siguen apagados mientras esto sea false.
 */
export const consentImplemented = false;

const STORAGE_KEY = 'cumple-en-orden:plan:v1';

function readEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function originFrom(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

const origin = originFrom(readEnv('PUBLIC_SITE_URL'));
const indexingRequested = readEnv('PUBLIC_ALLOW_INDEXING') === 'true';
const contactEmail = readEnv('PUBLIC_CONTACT_EMAIL');
const adsenseClient = readEnv('PUBLIC_ADSENSE_CLIENT');
const adsenseSlot = readEnv('PUBLIC_ADSENSE_SLOT');
const analyticsId = readEnv('PUBLIC_ANALYTICS_ID');

export const site = {
  brand: 'Festejito',
  domain: 'festejito.com.ar',
  promise:
    'Organizá el cumple: calculá cuánto comprar, compará presupuestos y llevá el control de lo que falta.',
  description:
    'Planificá un cumpleaños infantil en Argentina: cantidades orientativas, presupuesto en pesos y una lista de lo que falta. El plan queda en este navegador.',
  locale: 'es-AR',
  storageKey: STORAGE_KEY,
  cityLabel: 'Córdoba Capital',
  provinceLabel: 'Córdoba',
  countryLabel: 'Argentina',
  origin,
  allowIndexing: indexingRequested && origin !== null,
  indexingRequested,
  contactEmail: contactEmail.includes('@') ? contactEmail : '',
  adsenseClient,
  adsenseSlot,
  adsEnabled: consentImplemented && adsenseClient.startsWith('ca-pub-') && adsenseSlot.length > 0,
  analyticsId,
  analyticsEnabled: consentImplemented && analyticsId.length > 0,
} as const;

export function absoluteUrl(path: string): string | null {
  if (!site.origin) return null;
  return new URL(path, site.origin).href;
}
