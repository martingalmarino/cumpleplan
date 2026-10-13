import { site } from '../../config/site';
import { createPlan } from './createPlan';
import { parseBackup } from './schema';
import { readStoredPlan, removeStoredPlan, writeStoredPlan } from './storage';
import type { Plan } from './types';

export type SaveState = 'idle' | 'pending' | 'saved' | 'unavailable' | 'error';

export type LoadIssue = {
  kind: 'corrupt' | 'future' | 'invalid' | 'unavailable';
  message: string;
};

export type PlannerSnapshot = {
  ready: boolean;
  plan: Plan;
  saveState: SaveState;
  saveMessage: string | null;
  conflict: Plan | null;
  externalClear: boolean;
  loadIssue: LoadIssue | null;
  holdWrites: boolean;
};

const loadingPlan = createPlan('1970-01-01T00:00:00.000Z');

export const loadingSnapshot: PlannerSnapshot = {
  ready: false,
  plan: loadingPlan,
  saveState: 'idle',
  saveMessage: null,
  conflict: null,
  externalClear: false,
  loadIssue: null,
  holdWrites: true,
};

let snapshot: PlannerSnapshot = loadingSnapshot;
const listeners = new Set<() => void>();
let hydrated = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function emit(next: PlannerSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): PlannerSnapshot {
  return snapshot;
}

export function getServerSnapshot(): PlannerSnapshot {
  return loadingSnapshot;
}

function browserStore(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function flushSave(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!snapshot.ready || snapshot.holdWrites) return;
  const storage = browserStore();
  if (!storage) {
    emit({
      ...snapshot,
      saveState: 'unavailable',
      holdWrites: true,
      saveMessage: 'Este navegador no dejó guardar el plan. Sigue en esta pestaña: exportalo para no perderlo.',
    });
    return;
  }
  const result = writeStoredPlan(storage, snapshot.plan);
  if (result.status === 'saved') {
    emit({ ...snapshot, saveState: 'saved', saveMessage: 'Guardado en este navegador' });
    return;
  }
  emit({ ...snapshot, saveState: 'unavailable', saveMessage: result.error });
}

function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('storage', onStorage);
  window.addEventListener('pagehide', flushSave);
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a')) flushSave();
    },
    true,
  );
}

function onStorage(event: StorageEvent) {
  if (event.key !== site.storageKey || !snapshot.ready) return;
  if (event.newValue == null) {
    emit({ ...snapshot, externalClear: true, conflict: null });
    return;
  }
  const parsed = parseBackup(event.newValue);
  if (!parsed.ok) return;
  if (parsed.plan.updatedAt === snapshot.plan.updatedAt && parsed.plan.id === snapshot.plan.id) return;
  emit({ ...snapshot, conflict: parsed.plan, externalClear: false });
}

export function hydrate(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  listen();
  const unavailable = 'Este navegador no dejó guardar el plan. Sigue en esta pestaña: exportalo para no perderlo.';
  const storage = browserStore();
  if (!storage) {
    emit({
      ...loadingSnapshot,
      ready: true,
      plan: createPlan(),
      saveState: 'unavailable',
      saveMessage: unavailable,
      holdWrites: true,
      loadIssue: { kind: 'unavailable', message: unavailable },
    });
    return;
  }
  let read: ReturnType<typeof readStoredPlan>;
  try {
    read = readStoredPlan(storage);
  } catch {
    emit({
      ...loadingSnapshot,
      ready: true,
      plan: createPlan(),
      saveState: 'unavailable',
      saveMessage: unavailable,
      holdWrites: true,
      loadIssue: { kind: 'unavailable', message: unavailable },
    });
    return;
  }
  if (read.status === 'ok') {
    emit({
      ...loadingSnapshot,
      ready: true,
      plan: read.plan,
      holdWrites: false,
      saveState: 'idle',
      saveMessage: null,
      loadIssue: null,
    });
    return;
  }
  if (read.status === 'empty') {
    emit({
      ...loadingSnapshot,
      ready: true,
      plan: createPlan(),
      holdWrites: false,
      saveState: 'idle',
      saveMessage: null,
      loadIssue: null,
    });
    return;
  }
  const kind = read.status === 'corrupt' ? 'corrupt' : read.status === 'future' ? 'future' : 'invalid';
  emit({
    ...loadingSnapshot,
    ready: true,
    plan: createPlan(),
    holdWrites: true,
    saveState: 'error',
    saveMessage: null,
    loadIssue: { kind, message: read.error },
  });
}

export function updatePlan(recipe: (plan: Plan) => Plan): void {
  if (!snapshot.ready) return;
  const drafted = recipe(snapshot.plan);
  const plan = { ...drafted, updatedAt: new Date().toISOString() };
  const holdWrites = snapshot.holdWrites;
  emit({
    ...snapshot,
    plan,
    saveState: holdWrites ? snapshot.saveState : 'pending',
    saveMessage: holdWrites ? snapshot.saveMessage : null,
  });
  if (holdWrites) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushSave, 350);
}

export function replacePlan(plan: Plan): void {
  emit({
    ...snapshot,
    ready: true,
    plan: { ...plan, updatedAt: new Date().toISOString() },
    holdWrites: false,
    conflict: null,
    externalClear: false,
    loadIssue: null,
    saveState: 'pending',
    saveMessage: null,
  });
  flushSave();
}

export function acceptConflict(): void {
  if (!snapshot.conflict) return;
  emit({
    ...snapshot,
    plan: snapshot.conflict,
    conflict: null,
    externalClear: false,
    holdWrites: false,
    loadIssue: null,
    saveState: 'saved',
    saveMessage: 'Guardado en este navegador',
  });
}

export function keepLocalPlan(): void {
  emit({ ...snapshot, conflict: null, externalClear: false, holdWrites: false });
  flushSave();
}

export function discardDamagedStorage(): void {
  const storage = browserStore();
  if (storage) removeStoredPlan(storage);
  emit({
    ...snapshot,
    plan: createPlan(),
    loadIssue: null,
    holdWrites: false,
    conflict: null,
    externalClear: false,
    saveState: 'pending',
    saveMessage: null,
  });
  flushSave();
}

export function resetPlan(): void {
  const storage = browserStore();
  if (storage) removeStoredPlan(storage);
  emit({
    ...snapshot,
    plan: createPlan(),
    holdWrites: false,
    loadIssue: null,
    conflict: null,
    externalClear: false,
    saveState: 'pending',
    saveMessage: null,
  });
  flushSave();
}
