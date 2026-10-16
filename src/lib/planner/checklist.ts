import type { Task } from './types';

type Seed = {
  id: string;
  title: string;
  offsetDays: number;
};

const seeds: Seed[] = [
  // 8-12 semanas antes (56-84 días)
  { id: 'task-seed-presupuesto', title: 'Definí el presupuesto objetivo', offsetDays: -70 },
  { id: 'task-seed-fecha-lugar', title: 'Elegí fecha y tipo de lugar: casa, salón o aire libre', offsetDays: -70 },
  { id: 'task-seed-reservar-salon', title: 'Reservar salón (los fines de semana se llenan rápido)', offsetDays: -63 },
  { id: 'task-seed-animacion', title: 'Contratar animación', offsetDays: -56 },
  
  // 6-8 semanas antes (42-56 días)
  { id: 'task-seed-asistentes', title: 'Estimá cuántos chicos y adultos van a venir', offsetDays: -49 },
  { id: 'task-seed-invitaciones', title: 'Mandar invitaciones (físicas o digitales)', offsetDays: -49 },
  { id: 'task-seed-presupuestos', title: 'Pedí presupuestos de torta, catering y decoración', offsetDays: -42 },
  
  // 4-6 semanas antes (28-42 días)
  { id: 'task-seed-torta', title: 'Encargar torta', offsetDays: -35 },
  { id: 'task-seed-menu', title: 'Definir el menú (cantidad y tipo de comida)', offsetDays: -35 },
  { id: 'task-seed-fotos', title: 'Coordinar fotos o video (si corresponde)', offsetDays: -28 },
  { id: 'task-seed-decoracion', title: 'Comprar o encargar decoración, globos y cotillón', offsetDays: -28 },
  
  // 2-3 semanas antes (14-21 días)
  { id: 'task-seed-souvenirs', title: 'Preparar souvenirs o bolsitas sorpresa', offsetDays: -21 },
  { id: 'task-seed-conteo', title: 'Confirmar cantidad de asistentes', offsetDays: -14 },
  { id: 'task-seed-confirmar', title: 'Confirmar todos los servicios contratados', offsetDays: -14 },
  
  // 1 semana antes (7 días)
  { id: 'task-seed-lista-compras', title: 'Armar lista de compras final (comida, bebidas, descartables)', offsetDays: -7 },
  { id: 'task-seed-saldos', title: 'Revisar saldos pendientes del presupuesto', offsetDays: -7 },
  
  // 2-3 días antes
  { id: 'task-seed-secos', title: 'Comprar lo no perecedero (descartables, bebidas, etc)', offsetDays: -2 },
  { id: 'task-seed-materiales', title: 'Preparar materiales y decoración', offsetDays: -2 },
  
  // 1 día antes
  { id: 'task-seed-frescos', title: 'Comprar comida fresca (si corresponde)', offsetDays: -1 },
  { id: 'task-seed-cantidades', title: 'Revisar cantidades y horarios finales', offsetDays: -1 },
  { id: 'task-seed-transporte', title: 'Organizar transporte de todo lo que hay que llevar', offsetDays: -1 },
  
  // Día del cumple
  { id: 'task-seed-armado', title: 'Llegar temprano para el armado y decoración', offsetDays: 0 },
  { id: 'task-seed-recibir', title: 'Recibir a proveedores (animación, catering, etc)', offsetDays: 0 },
  { id: 'task-seed-ubicar', title: 'Ubicar comida, bebida y torta', offsetDays: 0 },
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
