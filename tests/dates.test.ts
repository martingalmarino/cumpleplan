import { describe, expect, it } from 'vitest';
import { addCalendarDays, presentTask, todayInArgentina } from '../src/lib/planner/dates';
import type { Task } from '../src/lib/planner/types';

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-seed-presupuesto',
    title: 'Definí el presupuesto objetivo',
    note: '',
    offsetDays: -28,
    dueOverride: null,
    done: false,
    origin: 'seed',
    ...overrides,
  };
}

describe('fechas del checklist', () => {
  it('usa el calendario de Argentina y no corre un día por UTC', () => {
    expect(todayInArgentina(new Date('2026-03-15T02:00:00.000Z'))).toBe('2026-03-14');
    expect(todayInArgentina(new Date('2026-01-01T02:30:00.000Z'))).toBe('2025-12-31');
  });

  it('cruza meses y años, incluido un febrero bisiesto', () => {
    expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addCalendarDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addCalendarDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addCalendarDays('2026-10-13', -28)).toBe('2026-09-15');
  });

  it('marca vencida, conserva el hecho y respeta la fecha manual', () => {
    const open = presentTask(task(), '2026-10-13', '2026-10-13');
    expect(open.dueIso).toBe('2026-09-15');
    expect(open.status).toBe('Vencida');

    const done = presentTask(task({ done: true }), '2026-12-01', '2026-12-20');
    expect(done.status).toBe('Hecha');

    const manual = presentTask(task({ dueOverride: '2026-11-01', done: true }), '2026-12-01', '2026-12-20');
    expect(manual.dueIso).toBe('2026-11-01');
    expect(manual.manualDate).toBe(true);
    expect(manual.status).toBe('Hecha');

    const undated = presentTask(task(), null, '2026-10-13');
    expect(undated.dateLabel).toBeNull();
    expect(undated.status).toBe('Pendiente');
    expect(undated.timingLabel).toBe('4 semanas antes');
  });
});
