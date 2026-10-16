import { publishedProviders, type ProviderCategory, type ProviderRecord } from './records';
import { provinceSlug, citySlug, categorySlug, isIndexable } from './routes';

/**
 * Agrupa proveedores por provincia
 */
export function groupByProvince(providers: ProviderRecord[]): Map<string, ProviderRecord[]> {
  const groups = new Map<string, ProviderRecord[]>();
  for (const provider of providers) {
    const key = provider.province;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(provider);
  }
  return groups;
}

/**
 * Agrupa proveedores por ciudad dentro de una provincia
 */
export function groupByCity(providers: ProviderRecord[], province: string): Map<string, ProviderRecord[]> {
  const filtered = providers.filter((p) => p.province === province);
  const groups = new Map<string, ProviderRecord[]>();
  for (const provider of filtered) {
    const key = provider.city;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(provider);
  }
  return groups;
}

/**
 * Agrupa proveedores por categoría
 */
export function groupByCategory(providers: ProviderRecord[]): Map<ProviderCategory, ProviderRecord[]> {
  const groups = new Map<ProviderCategory, ProviderRecord[]>();
  for (const provider of providers) {
    for (const category of provider.categories) {
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(provider);
    }
  }
  return groups;
}

/**
 * Genera todas las rutas indexables del directorio
 */
export type DirectoryRoute = {
  path: string;
  province?: string;
  city?: string;
  category?: ProviderCategory;
  count: number;
  indexable: boolean;
};

export function generateDirectoryRoutes(): DirectoryRoute[] {
  const providers = publishedProviders();
  const routes: DirectoryRoute[] = [];

  if (providers.length === 0) return routes;

  // Índice nacional
  routes.push({
    path: '/directorio/',
    count: providers.length,
    indexable: isIndexable(providers.length),
  });

  // Agrupar por provincia
  const byProvince = groupByProvince(providers);

  for (const [province, provinceProviders] of byProvince) {
    const provinceCount = provinceProviders.length;
    const provinceIndexable = isIndexable(provinceCount);

    // /directorio/{provincia}/
    routes.push({
      path: `/directorio/${provinceSlug(province)}/`,
      province,
      count: provinceCount,
      indexable: provinceIndexable,
    });

    // Agrupar por rubro en la provincia
    const provinceByCategory = groupByCategory(provinceProviders);
    for (const [category, categoryProviders] of provinceByCategory) {
      const count = categoryProviders.length;
      routes.push({
        path: `/directorio/${provinceSlug(province)}/${categorySlug(category)}/`,
        province,
        category,
        count,
        indexable: isIndexable(count),
      });
    }

    // Agrupar por ciudad en la provincia
    const byCityInProvince = groupByCity(providers, province);
    for (const [city, cityProviders] of byCityInProvince) {
      const cityCount = cityProviders.length;
      
      // /directorio/{provincia}/{ciudad}/
      routes.push({
        path: `/directorio/${provinceSlug(province)}/${citySlug(city)}/`,
        province,
        city,
        count: cityCount,
        indexable: isIndexable(cityCount),
      });

      // Agrupar por rubro en la ciudad
      const cityByCategory = groupByCategory(cityProviders);
      for (const [category, categoryProviders] of cityByCategory) {
        const count = categoryProviders.length;
        routes.push({
          path: `/directorio/${provinceSlug(province)}/${citySlug(city)}/${categorySlug(category)}/`,
          province,
          city,
          category,
          count,
          indexable: isIndexable(count),
        });
      }
    }
  }

  return routes;
}

/**
 * Filtra proveedores por provincia, ciudad y/o categoría
 */
export function filterByLocation(
  providers: ProviderRecord[],
  filters: { province?: string; city?: string; category?: ProviderCategory }
): ProviderRecord[] {
  return providers.filter((p) => {
    if (filters.province && p.province !== filters.province) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.category && !p.categories.includes(filters.category)) return false;
    return true;
  });
}
