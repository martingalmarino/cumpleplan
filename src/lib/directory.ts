import type { ProviderCategory } from '../data/providers/records';
import { directoryIndexPath, directoryProvinceRubroPath, directoryProvincePath } from '../data/providers/routes';
import type { BudgetCategory } from './planner/types';

/**
 * Mapea categorías de presupuesto a rubros del directorio
 */
export function budgetCategoryToRubro(category: BudgetCategory): ProviderCategory | null {
  const mapping: Partial<Record<BudgetCategory, ProviderCategory>> = {
    lugar: 'salones',
    comida: 'tortas-catering',
    bebidas: 'tortas-catering',
    torta: 'tortas-catering',
    decoracion: 'decoracion',
    animacion: 'animacion',
  };
  return mapping[category] ?? null;
}

/**
 * Mapea títulos de tareas a rubros del directorio
 * Detecta palabras clave en el título para sugerir el rubro apropiado
 */
export function taskTitleToRubro(title: string): ProviderCategory | null {
  const lower = title.toLowerCase();
  
  if (lower.includes('salón') || lower.includes('salon') || lower.includes('lugar') || lower.includes('reservar')) {
    return 'salones';
  }
  if (lower.includes('animación') || lower.includes('animacion') || lower.includes('animador')) {
    return 'animacion';
  }
  if (lower.includes('torta') || lower.includes('catering') || lower.includes('comida') || lower.includes('encargar')) {
    return 'tortas-catering';
  }
  if (lower.includes('decoración') || lower.includes('decoracion') || lower.includes('globos')) {
    return 'decoracion';
  }
  
  return null;
}

/**
 * Obtiene el nombre legible de un rubro para CTAs
 */
export function getRubroLabel(rubro: ProviderCategory): string {
  const labels: Record<ProviderCategory, string> = {
    salones: 'Salones',
    animacion: 'Animación',
    'tortas-catering': 'Tortas y catering',
    decoracion: 'Decoración',
  };
  return labels[rubro];
}

/**
 * Genera la URL del directorio para un rubro, considerando la provincia del usuario
 */
export function getDirectoryUrl(rubro: ProviderCategory | null, province?: string): string {
  if (!rubro) return directoryIndexPath;
  
  // Si tenemos provincia, ir a /directorio/{provincia}/{rubro}/
  if (province) {
    return directoryProvinceRubroPath(province, rubro);
  }
  
  // Si no hay provincia, ir al índice nacional
  // TODO: cuando haya más provincias, se podría ir a /directorio/?rubro={rubro}
  return directoryIndexPath;
}

/**
 * Genera texto del CTA para ver proveedores de un rubro
 */
export function getDirectoryCTA(rubro: ProviderCategory): string {
  const labels: Record<ProviderCategory, string> = {
    salones: 'Ver salones',
    animacion: 'Ver animación',
    'tortas-catering': 'Ver tortas y catering',
    decoracion: 'Ver decoración',
  };
  return labels[rubro];
}

/**
 * Lista de provincias argentinas disponibles
 * Por ahora solo Córdoba está en el directorio, pero preparado para expansión
 */
export const provinces = [
  'Córdoba',
  'Buenos Aires',
  'Santa Fe',
  'Mendoza',
  'Tucumán',
  'Salta',
  'Entre Ríos',
  'Misiones',
  'Corrientes',
  'San Juan',
  'Jujuy',
  'Río Negro',
  'Neuquén',
  'Formosa',
  'Chaco',
  'Chubut',
  'San Luis',
  'Catamarca',
  'La Rioja',
  'La Pampa',
  'Santa Cruz',
  'Tierra del Fuego',
  'Santiago del Estero',
] as const;
