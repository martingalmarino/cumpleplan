import { site } from '../../config/site';
import { createPlan } from './createPlan';
import { parseBackup, type BackupResult } from './schema';
import type { Plan } from './types';

export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type StoredRead =
  | { status: 'empty' }
  | { status: 'ok'; plan: Plan }
  | { status: 'corrupt'; error: string }
  | { status: 'future'; error: string }
  | { status: 'invalid'; error: string };

export type StoredWrite =
  | { status: 'saved' }
  | { status: 'unavailable'; error: string };

export function readStoredPlan(store: KeyValueStore, key = site.storageKey): StoredRead {
  let raw: string | null;
  try {
    raw = store.getItem(key);
  } catch {
    return { status: 'corrupt', error: 'El navegador no dejó leer el plan guardado.' };
  }
  if (raw == null || raw.trim() === '') return { status: 'empty' };
  const parsed = parseBackup(raw);
  if (parsed.ok) return { status: 'ok', plan: parsed.plan };
  if (parsed.kind === 'future') return { status: 'future', error: parsed.error };
  if (parsed.kind === 'malformed') return { status: 'corrupt', error: parsed.error };
  return { status: 'invalid', error: parsed.error };
}

export function writeStoredPlan(store: KeyValueStore, plan: Plan, key = site.storageKey): StoredWrite {
  try {
    store.setItem(key, JSON.stringify(plan));
    return { status: 'saved' };
  } catch {
    return {
      status: 'unavailable',
      error: 'Este navegador no dejó guardar el plan. Sigue en esta pestaña: exportalo para no perderlo.',
    };
  }
}

export function removeStoredPlan(store: KeyValueStore, key = site.storageKey): StoredWrite {
  try {
    store.removeItem(key);
    return { status: 'saved' };
  } catch {
    return { status: 'unavailable', error: 'No se pudo borrar el plan guardado en este navegador.' };
  }
}

export function backupKindMessage(result: Extract<BackupResult, { ok: false }>): string {
  return result.error;
}

export function emptyPlan(): Plan {
  return createPlan();
}
