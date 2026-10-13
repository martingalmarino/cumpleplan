import { plannerLimits } from '../../config/calculator';

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormat = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 2,
});

export function formatArs(centavos: number): string {
  return currency.format(centavos / 100);
}

export function formatQty(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return quantityFormat.format(value);
}

export type MoneyParse = { ok: true; centavos: number } | { ok: false; error: string };

/**
 * Acepta importes argentinos sin ambigüedad:
 * - coma = decimal, hasta dos dígitos: 1250,50
 * - punto = miles en grupos de tres: 1.250 o 1.250,50
 * - 12.50 se rechaza: el punto no se interpreta como decimal
 */
export function parseArsToCentavos(raw: string): MoneyParse {
  const trimmed = raw.trim().replace(/^\$\s*/, '');
  if (!trimmed) return { ok: false, error: 'Ingresá un importe. Ejemplo: 1.250,50.' };
  if (/\s/.test(trimmed)) {
    return { ok: false, error: 'Escribí el importe sin espacios. Ejemplo: 1.250,50.' };
  }
  if (trimmed.startsWith('-')) {
    return { ok: false, error: 'El importe no puede ser negativo.' };
  }
  if (!/^[\d.,]+$/.test(trimmed)) {
    return { ok: false, error: 'Usá números, punto de miles y coma decimal. Ejemplo: 1.250,50.' };
  }

  const comma = trimmed.includes(',');
  const dot = trimmed.includes('.');
  let canonical = trimmed;

  if (comma && dot) {
    if (!/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(trimmed)) {
      return { ok: false, error: 'No pudimos leer ese importe. Ejemplo: 1.250,50.' };
    }
  } else if (comma) {
    if (!/^\d+(,\d{1,2})?$/.test(trimmed)) {
      return {
        ok: false,
        error: 'La coma es el decimal y admite hasta dos dígitos. Ejemplo: 1250,50.',
      };
    }
  } else if (dot) {
    if (!/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
      return {
        ok: false,
        error: 'Ese punto es ambiguo. Para decimales usá coma, por ejemplo 1250,50.',
      };
    }
  } else if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Ingresá un importe válido.' };
  }

  canonical = trimmed.replace(/\./g, '').replace(',', '.');
  const [whole, frac = ''] = canonical.split('.');
  if (whole.length > 12) return { ok: false, error: 'El importe es demasiado grande.' };
  const centavos = Number(whole) * 100 + Number((frac + '00').slice(0, 2));
  if (!Number.isSafeInteger(centavos) || centavos > plannerLimits.maxCentavos) {
    return { ok: false, error: 'El importe es demasiado grande.' };
  }
  return { ok: true, centavos };
}

export function formatEditableArs(centavos: number | null): string {
  if (centavos == null) return '';
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}
