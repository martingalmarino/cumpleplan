import LZString from 'lz-string';
import type { Plan, ShoppingItem, Task } from './planner/types';
import { parseBackup, type BackupResult } from './planner/schema';

/**
 * Límite conservador para URLs de WhatsApp (2000 caracteres)
 * Las URLs muy largas pueden fallar en algunos dispositivos
 */
const WHATSAPP_URL_LIMIT = 2000;

/**
 * Formatea la lista de compras para WhatsApp
 * Incluye solo items no removidos del menú
 */
export function formatShoppingForWhatsApp(items: ShoppingItem[], pendingOnly = false): string {
  const visible = items.filter((item) => !item.removedFromMenu);
  const filtered = pendingOnly ? visible.filter((item) => !item.bought) : visible;

  if (filtered.length === 0) {
    return pendingOnly ? '📋 Lista de compras\n\nNo hay items pendientes.' : '📋 Lista de compras\n\nLista vacía.';
  }

  const lines: string[] = ['📋 *Lista de compras*', ''];

  // Agrupar por categoría
  const groups = new Map<string, ShoppingItem[]>();
  for (const item of filtered) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }

  for (const [category, group] of groups) {
    lines.push(`*${category}*`);
    for (const item of group) {
      const mark = item.bought ? '✅' : '⬜';
      lines.push(`${mark} ${item.name}: ${item.quantity} ${item.unit}`);
    }
    lines.push('');
  }

  const text = lines.join('\n').trim();

  // Si excede el límite, truncar con aviso
  if (text.length > WHATSAPP_URL_LIMIT) {
    const truncated = text.substring(0, WHATSAPP_URL_LIMIT - 50);
    return truncated + '\n\n... (lista truncada)';
  }

  return text;
}

/**
 * Formatea el checklist para WhatsApp
 * Agrupa por offset de días
 */
export function formatChecklistForWhatsApp(tasks: Task[], eventDate: string | null, pendingOnly = false): string {
  const filtered = pendingOnly ? tasks.filter((task) => !task.done) : tasks;

  if (filtered.length === 0) {
    return pendingOnly ? '✓ Checklist\n\nNo hay tareas pendientes.' : '✓ Checklist\n\nLista vacía.';
  }

  const lines: string[] = ['✓ *Checklist del cumple*', ''];

  if (eventDate) {
    lines.push(`📅 Fecha: ${new Date(eventDate).toLocaleDateString('es-AR')}`);
    lines.push('');
  }

  // Agrupar por timing relativo
  const groups = new Map<number, Task[]>();
  for (const task of filtered.sort((a, b) => a.offsetDays - b.offsetDays)) {
    const list = groups.get(task.offsetDays) ?? [];
    list.push(task);
    groups.set(task.offsetDays, list);
  }

  for (const [offsetDays, group] of groups) {
    const timing =
      offsetDays === 0
        ? '📍 Día del cumple'
        : offsetDays === -1
          ? '⏰ 1 día antes'
          : offsetDays < 0
            ? `⏰ ${Math.abs(offsetDays)} días antes`
            : `⏰ ${offsetDays} días después`;

    lines.push(timing);
    for (const task of group) {
      const mark = task.done ? '✅' : '⬜';
      lines.push(`${mark} ${task.title}`);
    }
    lines.push('');
  }

  const text = lines.join('\n').trim();

  // Si excede el límite, truncar con aviso
  if (text.length > WHATSAPP_URL_LIMIT) {
    const truncated = text.substring(0, WHATSAPP_URL_LIMIT - 50);
    return truncated + '\n\n... (lista truncada)';
  }

  return text;
}

/**
 * Genera URL de WhatsApp con texto pre-formateado
 */
export function getWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Comprime y codifica un plan para compartir via URL
 * Retorna el hash fragment (sin el #)
 */
export function encodePlanToUrl(plan: Plan): string {
  const json = JSON.stringify(plan);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decodifica y valida un plan desde un hash fragment
 */
export function decodePlanFromUrl(hash: string): BackupResult {
  try {
    // Remover # si está presente
    const cleaned = hash.startsWith('#') ? hash.substring(1) : hash;

    if (!cleaned) {
      return { ok: false, error: 'El link no contiene un plan.', kind: 'malformed' };
    }

    const decompressed = LZString.decompressFromEncodedURIComponent(cleaned);

    if (!decompressed) {
      return { ok: false, error: 'No se pudo decodificar el plan. El link puede estar dañado.', kind: 'malformed' };
    }

    // Validar con el schema existente
    return parseBackup(decompressed);
  } catch (error) {
    return {
      ok: false,
      error: 'Error al procesar el link compartido.',
      kind: 'malformed',
    };
  }
}

/**
 * Genera URL completa compartible del plan
 */
export function getShareableUrl(plan: Plan, baseUrl: string): string {
  const encoded = encodePlanToUrl(plan);
  return `${baseUrl}#${encoded}`;
}

/**
 * Verifica si hay un plan en el hash de la URL actual
 */
export function hasSharedPlanInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hash.length > 1;
}

/**
 * Obtiene el plan compartido del hash de la URL actual
 */
export function getSharedPlanFromUrl(): BackupResult | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;
  return decodePlanFromUrl(hash);
}

/**
 * Limpia el hash de la URL
 */
export function clearUrlHash(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
