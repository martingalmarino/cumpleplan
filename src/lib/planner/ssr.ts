/**
 * SSR helpers: crear planes predeterminados para renderizar en el servidor
 * Estos valores se usan solo para el HTML estático que ven los crawlers.
 * En el cliente se reemplazan con el plan guardado del usuario.
 */

import { createPlan } from './createPlan';
import type { Plan } from './types';

/**
 * Plan predeterminado para SEO con valores típicos argentinos
 */
export function createDefaultPlanForSSR(): Plan {
  const plan = createPlan();
  
  // Valores típicos para un cumpleaños infantil en Argentina
  plan.event.childrenCount = 20;
  plan.event.adultsCount = 10;
  plan.event.label = 'Cumpleaños infantil';
  plan.event.date = getDefaultEventDate();
  plan.event.durationHours = 3;
  plan.event.meal = 'snack';
  
  return plan;
}

/**
 * Fecha predeterminada: 8 semanas desde hoy
 */
function getDefaultEventDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 56); // 8 semanas
  return date.toISOString();
}

/**
 * Verifica si un plan tiene valores custom (no es el plan vacío inicial)
 */
export function planHasCustomData(plan: Plan): boolean {
  // Si cambió la cantidad de chicos del default inicial (15), tiene datos custom
  if (plan.event.childrenCount !== 15) return true;
  
  // Si tiene líneas de presupuesto con precios
  if (plan.budgetLines.some(line => line.estimatedUnitPrice > 0 || line.committedAmount > 0)) return true;
  
  // Si tiene tareas marcadas como hechas
  if (plan.tasks.some(task => task.done)) return true;
  
  // Si tiene items de compras marcados como comprados
  if (plan.shoppingItems.some(item => item.bought)) return true;
  
  return false;
}
