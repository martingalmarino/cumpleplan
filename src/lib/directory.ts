import type { ProviderCategory } from '../data/providers/records';
import { generateDirectoryRoutes } from '../data/providers/groups';
import { directoryIndexPath, directoryProvinceRubroPath, directoryProvincePath } from '../data/providers/routes';
import type { BudgetCategory } from './planner/types';

/**
 * Cache de rutas válidas del directorio
 * Se inicializa bajo demanda y se mantiene durante la ejecución
 */
let cachedValidPaths: Set<string> | null = null;

function getValidDirectoryPaths(): Set<string> {
  if (!cachedValidPaths) {
    const routes = generateDirectoryRoutes();
    cachedValidPaths = new Set(routes.map((route) => route.path));
  }
  return cachedValidPaths;
}

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
 * Las verificaciones más específicas van primero
 */
export function taskTitleToRubro(title: string): ProviderCategory | null {
  const lower = title.toLowerCase();
  
  // Palabras específicas primero
  if (lower.includes('salón') || lower.includes('salon') || lower.includes('lugar') || lower.includes('reservar')) {
    return 'salones';
  }
  if (lower.includes('animación') || lower.includes('animacion') || lower.includes('animador')) {
    return 'animacion';
  }
  if (lower.includes('decoración') || lower.includes('decoracion') || lower.includes('globos')) {
    return 'decoracion';
  }
  // Tortas y catering al final porque "encargar" es genérico
  if (lower.includes('torta') || lower.includes('catering') || lower.includes('comida') || lower.includes('encargar')) {
    return 'tortas-catering';
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
 * Genera la URL del directorio para un rubro, verificando que exista la página
 * Fallback: /directorio/{provincia}/{rubro}/ → /directorio/{provincia}/ → /directorio/
 */
export function getDirectoryUrl(rubro: ProviderCategory | null, province?: string): string {
  if (!rubro) return directoryIndexPath;
  
  const validPaths = getValidDirectoryPaths();
  
  // Intentar /directorio/{provincia}/{rubro}/
  if (province) {
    const provinceCategoryPath = directoryProvinceRubroPath(province, rubro);
    if (validPaths.has(provinceCategoryPath)) {
      return provinceCategoryPath;
    }
    
    // Fallback a /directorio/{provincia}/
    const provinceOnlyPath = directoryProvincePath(province);
    if (validPaths.has(provinceOnlyPath)) {
      return provinceOnlyPath;
    }
  }
  
  // Fallback final al índice nacional
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
