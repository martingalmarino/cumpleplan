import type { Task } from './types';

const RELATIVE: Record<number, string> = {
  [-28]: '4 semanas antes',
  [-21]: '3 semanas antes',
  [-14]: '2 semanas antes',
  [-7]: '1 semana antes',
  [-2]: '2 días antes',
  [-1]: 'El día anterior',
  [0]: 'El día del cumple',
};

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 2000 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayInArgentina(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Cordoba',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function formatCalendarDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function relativeTiming(offsetDays: number): string {
  if (RELATIVE[offsetDays]) return RELATIVE[offsetDays];
  if (offsetDays < 0) {
    const days = Math.abs(offsetDays);
    return days === 1 ? '1 día antes' : `${days} días antes`;
  }
  if (offsetDays > 0) {
    return offsetDays === 1 ? '1 día después' : `${offsetDays} días después`;
  }
  return 'El día del cumple';
}

export type TaskStatus = 'Hecha' | 'Pendiente' | 'Vencida';

export type TaskView = {
  timingLabel: string;
  dateLabel: string | null;
  dueIso: string | null;
  status: TaskStatus;
  manualDate: boolean;
};

export function presentTask(task: Task, eventDate: string | null, today = todayInArgentina()): TaskView {
  const timingLabel = relativeTiming(task.offsetDays);
  if (task.dueOverride && isValidCalendarDate(task.dueOverride)) {
    return {
      timingLabel,
      dateLabel: formatCalendarDate(task.dueOverride),
      dueIso: task.dueOverride,
      status: task.done ? 'Hecha' : task.dueOverride < today ? 'Vencida' : 'Pendiente',
      manualDate: true,
    };
  }
  if (!eventDate || !isValidCalendarDate(eventDate)) {
    return {
      timingLabel,
      dateLabel: null,
      dueIso: null,
      status: task.done ? 'Hecha' : 'Pendiente',
      manualDate: false,
    };
  }
  const dueIso = addCalendarDays(eventDate, task.offsetDays);
  return {
    timingLabel,
    dateLabel: formatCalendarDate(dueIso),
    dueIso,
    status: task.done ? 'Hecha' : dueIso < today ? 'Vencida' : 'Pendiente',
    manualDate: false,
  };
}
