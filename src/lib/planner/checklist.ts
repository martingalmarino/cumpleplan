import type { Task } from './types';

type Seed = {
  id: string;
  title: string;
  offsetDays: number;
};

const seeds: Seed[] = [
  { id: 'task-seed-presupuesto', title: 'Definí el presupuesto objetivo', offsetDays: -28 },
  { id: 'task-seed-asistentes', title: 'Estimá cuántos chicos y adultos van a venir', offsetDays: -28 },
  { id: 'task-seed-lugar', title: 'Elegí el lugar: casa, salón o aire libre', offsetDays: -28 },
  { id: 'task-seed-presupuestos', title: 'Pedí presupuestos comparables del mismo servicio', offsetDays: -28 },
  { id: 'task-seed-reservar', title: 'Reservá los servicios que elegiste', offsetDays: -21 },
  { id: 'task-seed-menu', title: 'Definí el menú', offsetDays: -21 },
  { id: 'task-seed-fecha', title: 'Comunicá la fecha a quien tenga que saberla', offsetDays: -21 },
  { id: 'task-seed-torta', title: 'Encargá la torta si hace falta', offsetDays: -14 },
  { id: 'task-seed-decoracion', title: 'Revisá la decoración y lo que haya que alquilar', offsetDays: -14 },
  { id: 'task-seed-encargados', title: 'Anotá qué comida lleva cada adulto responsable', offsetDays: -14 },
  { id: 'task-seed-conteo', title: 'Actualizá la cantidad de asistentes', offsetDays: -7 },
  { id: 'task-seed-confirmar', title: 'Confirmá los servicios reservados', offsetDays: -7 },
  { id: 'task-seed-saldos', title: 'Revisá los saldos y la lista de compras', offsetDays: -7 },
  { id: 'task-seed-secos', title: 'Comprá lo no perecedero', offsetDays: -2 },
  { id: 'task-seed-materiales', title: 'Prepará los materiales y la decoración que ya tengas', offsetDays: -2 },
  { id: 'task-seed-lluvia', title: 'Si es al aire libre, revisá el plan por lluvia', offsetDays: -2 },
  { id: 'task-seed-cantidades', title: 'Revisá cantidades y horarios', offsetDays: -1 },
  { id: 'task-seed-transporte', title: 'Organizá el transporte de lo que haya que llevar', offsetDays: -1 },
  { id: 'task-seed-dia', title: 'Dejá armada la lista del día del cumple', offsetDays: -1 },
  { id: 'task-seed-armado', title: 'Controlá el armado del espacio', offsetDays: 0 },
  { id: 'task-seed-recibir', title: 'Recibí a los proveedores que confirmaste', offsetDays: 0 },
  { id: 'task-seed-ubicar', title: 'Ubicá la comida y la bebida', offsetDays: 0 },
  { id: 'task-seed-cierre', title: 'Revisá las tareas que todavía quedan abiertas', offsetDays: 0 },
];

export function seedTasks(): Task[] {
  return seeds.map((seed) => ({
    id: seed.id,
    title: seed.title,
    note: '',
    offsetDays: seed.offsetDays,
    dueOverride: null,
    done: false,
    origin: 'seed',
  }));
}

export function checklistProgress(tasks: Task[]): { done: number; total: number; ratio: number } {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}
