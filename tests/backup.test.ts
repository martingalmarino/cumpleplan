import { describe, expect, it } from 'vitest';
import { createPlan } from '../src/lib/planner/createPlan';
import { parseBackup } from '../src/lib/planner/schema';
import { readStoredPlan, writeStoredPlan, type KeyValueStore } from '../src/lib/planner/storage';
import { sanitizeAnalytics } from '../src/lib/analytics';

function memoryStore(initial: string | null = null): KeyValueStore & { value: string | null } {
  const state = { value: initial };
  return {
    get value() {
      return state.value;
    },
    set value(next: string | null) {
      state.value = next;
    },
    getItem: () => state.value,
    setItem: (_key, value) => {
      state.value = value;
    },
    removeItem: () => {
      state.value = null;
    },
  };
}

describe('respaldo y almacenamiento', () => {
  it('acepta un plan propio y rechaza datos dañados sin tocar el plan actual', () => {
    const plan = createPlan('2026-10-13T12:00:00.000Z');
    const snapshot = JSON.stringify(plan);
    const ok = parseBackup(JSON.stringify(plan));
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.preview.children).toBe(0);

    expect(parseBackup('{').ok).toBe(false);
    expect(parseBackup('null').ok).toBe(false);
    const future = parseBackup(JSON.stringify({ schemaVersion: 2, id: 'plan-x' }));
    expect(future.ok).toBe(false);
    if (!future.ok) expect(future.kind).toBe('future');
    const unsafe = parseBackup('{"schemaVersion":1,"__proto__":{"admin":true}}');
    expect(unsafe.ok).toBe(false);
    if (!unsafe.ok) expect(unsafe.kind).toBe('unsafe');
    expect(JSON.stringify(plan)).toBe(snapshot);
  });

  it('distingue almacenamiento vacío, corrupto y escritura denegada', () => {
    const empty = memoryStore(null);
    expect(readStoredPlan(empty).status).toBe('empty');

    const corrupt = memoryStore('{');
    expect(readStoredPlan(corrupt).status).toBe('corrupt');
    expect(corrupt.value).toBe('{');

    const future = memoryStore(JSON.stringify({ schemaVersion: 9 }));
    expect(readStoredPlan(future).status).toBe('future');

    const denied: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => undefined,
    };
    expect(writeStoredPlan(denied, createPlan()).status).toBe('unavailable');
  });

  it('la analítica solo conserva identificadores gruesos', () => {
    expect(
      sanitizeAnalytics({
        tool: 'comida',
        providerId: 'maria-membrillo',
        amount: 170000,
        notes: 'cumple de Juan',
        date: '2026-11-02',
        children: 20,
      }),
    ).toEqual({ tool: 'comida', providerId: 'maria-membrillo' });
  });
});
