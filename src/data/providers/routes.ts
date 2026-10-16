import { providerCategories, type ProviderCategory, type ProviderRecord } from './records';

/**
 * Normaliza texto para generar slugs: sin acentos, minúsculas, espacios por guiones.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Slug de provincia para URLs (ej: "cordoba", "buenos-aires")
 */
export function provinceSlug(province: string): string {
  return slugify(province);
}

/**
 * Slug de ciudad para URLs (ej: "cordoba-capital", "rosario")
 */
export function citySlug(city: string): string {
  return slugify(city);
}

/**
 * Slug de rubro para URLs (ej: "salones-infantiles", "animacion")
 */
export function categorySlug(category: ProviderCategory): string {
  const meta = providerCategories.find((item) => item.id === category);
  return meta ? meta.slug : category;
}

/**
 * Ruta del índice nacional del directorio
 */
export const directoryIndexPath = '/directorio/';

/**
 * Ruta del directorio de una provincia
 */
export function directoryProvincePath(province: string): string {
  return `/directorio/${provinceSlug(province)}/`;
}

/**
 * Ruta del directorio de una provincia + rubro
 */
export function directoryProvinceRubroPath(province: string, category: ProviderCategory): string {
  return `/directorio/${provinceSlug(province)}/${categorySlug(category)}/`;
}

/**
 * Ruta del directorio de una provincia + ciudad
 */
export function directoryProvinceCityPath(province: string, city: string): string {
  return `/directorio/${provinceSlug(province)}/${citySlug(city)}/`;
}

/**
 * Ruta del directorio de una provincia + ciudad + rubro
 */
export function directoryProvinceCityRubroPath(province: string, city: string, category: ProviderCategory): string {
  return `/directorio/${provinceSlug(province)}/${citySlug(city)}/${categorySlug(category)}/`;
}

/**
 * Ruta de la ficha de un proveedor
 */
export function providerPath(provider: ProviderRecord): string {
  return `/proveedor/${provider.slug}/`;
}

/**
 * Verifica si hay colisión entre un slug de ciudad y un slug de rubro
 */
export function hasSlugCollision(cities: string[], categories: ProviderCategory[]): boolean {
  const citySlugs = new Set(cities.map(citySlug));
  const categorySlugs = new Set(categories.map(categorySlug));
  for (const slug of citySlugs) {
    if (categorySlugs.has(slug)) return true;
  }
  return false;
}

/**
 * Threshold mínimo de proveedores para que una página sea indexable
 */
export const INDEXABLE_THRESHOLD = 3;

/**
 * Decide si una página debe ser indexable según la cantidad de proveedores
 */
export function isIndexable(count: number): boolean {
  return count >= INDEXABLE_THRESHOLD;
}
