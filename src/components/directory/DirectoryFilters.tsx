import type { ProviderCategory } from '../../data/providers/records';
import { CategoryIcon } from './CategoryIcon';
import { categorySlug, provinceSlug, citySlug } from '../../data/providers/routes';

type Props = {
  query: string;
  category: ProviderCategory | null;
  whatsappOnly: boolean;
  total: number;
  counts: { id: ProviderCategory; label: string; count: number }[];
  province?: string;
  city?: string;
  onQuery: (value: string) => void;
  onWhatsapp: (value: boolean) => void;
};

function categoryUrl(category: ProviderCategory | null, province?: string, city?: string): string {
  if (!province) {
    return '/directorio/';
  }
  
  const provinceUrl = provinceSlug(province);
  
  if (!city) {
    return category ? `/directorio/${provinceUrl}/${categorySlug(category)}/` : `/directorio/${provinceUrl}/`;
  }
  
  const cityUrl = citySlug(city);
  return category ? `/directorio/${provinceUrl}/${cityUrl}/${categorySlug(category)}/` : `/directorio/${provinceUrl}/${cityUrl}/`;
}

export function DirectoryFilters({ query, category, whatsappOnly, total, counts, province, city, onQuery, onWhatsapp }: Props) {
  return (
    <form className="directory-filters" role="search" aria-label="Filtrar proveedores" onSubmit={(event) => event.preventDefault()}>
      <div className="field directory-filters__search">
        <label htmlFor="provider-search">Buscar por nombre, barrio o servicio</label>
        <input id="provider-search" type="search" value={query} autoComplete="off" onChange={(event) => onQuery(event.target.value)} />
      </div>
      <fieldset className="directory-filters__categories">
        <legend className="visually-hidden">Rubro</legend>
        <a
          href={categoryUrl(null, province, city)}
          className="category-chip"
          aria-current={category === null ? 'true' : undefined}
        >
          <span>Todos</span>
          <span className="category-chip__count">{total}</span>
        </a>
        {counts.map((item) => (
          <a
            key={item.id}
            href={categoryUrl(item.id, province, city)}
            className="category-chip"
            aria-current={category === item.id ? 'true' : undefined}
          >
            <CategoryIcon category={item.id} size="xs" />
            <span>{item.label}</span>
            <span className="category-chip__count">{item.count}</span>
          </a>
        ))}
      </fieldset>
      <label className="check-field directory-filters__whatsapp">
        <input type="checkbox" checked={whatsappOnly} onChange={(event) => onWhatsapp(event.target.checked)} />
        <span>Con WhatsApp</span>
      </label>
    </form>
  );
}
