import type { ProviderCategory } from '../../data/providers/records';
import { CategoryIcon } from './CategoryIcon';
import { categorySlug, provinceSlug, citySlug } from '../../data/providers/routes';

type Props = {
  query: string;
  category: ProviderCategory | null;
  whatsappOnly: boolean;
  zona: string | null;
  capacidadMin: number | null;
  edadMin: number | null;
  edadMax: number | null;
  total: number;
  counts: { id: ProviderCategory; label: string; count: number }[];
  zonasWithCounts: { zona: string; count: number }[];
  province?: string;
  city?: string;
  onQuery: (value: string) => void;
  onWhatsapp: (value: boolean) => void;
  onZona: (value: string | null) => void;
  onCapacidad: (value: number | null) => void;
  onEdadRange: (min: number | null, max: number | null) => void;
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

export function DirectoryFilters({ 
  query, 
  category, 
  whatsappOnly, 
  zona,
  capacidadMin,
  edadMin,
  edadMax,
  total, 
  counts, 
  zonasWithCounts,
  province, 
  city, 
  onQuery, 
  onWhatsapp,
  onZona,
  onCapacidad,
  onEdadRange,
}: Props) {
  return (
    <form className="directory-filters" role="search" aria-label="Filtrar proveedores" onSubmit={(event) => event.preventDefault()}>
      <div className="field directory-filters__search">
        <label htmlFor="provider-search">Buscar por nombre o barrio</label>
        <input id="provider-search" type="search" value={query} autoComplete="off" onChange={(event) => onQuery(event.target.value)} />
      </div>
      
      <label className="check-field directory-filters__whatsapp">
        <input type="checkbox" checked={whatsappOnly} onChange={(event) => onWhatsapp(event.target.checked)} />
        <span>Con WhatsApp</span>
      </label>

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
            <span>{item.label}</span>
            <span className="category-chip__count">{item.count}</span>
          </a>
        ))}
      </fieldset>

      <fieldset className="directory-filters__section">
        <legend>Zona / Barrio</legend>
        <div className="directory-filters__zona-list">
          <button 
            type="button"
            className={`directory-filters__zona-chip ${!zona ? 'active' : ''}`}
            onClick={() => onZona(null)}
          >
            Todas <span className="count">{total}</span>
          </button>
          {zonasWithCounts.slice(0, 12).map(({ zona: z, count }) => (
            <button
              key={z}
              type="button"
              className={`directory-filters__zona-chip ${zona === z ? 'active' : ''}`}
              onClick={() => onZona(zona === z ? null : z)}
            >
              {z} <span className="count">{count}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="directory-filters__section">
        <legend>Capacidad mínima</legend>
        <select 
          value={capacidadMin ?? ''}
          onChange={(e) => onCapacidad(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="directory-filters__select"
        >
          <option value="">Todas</option>
          <option value="30">30+ personas</option>
          <option value="50">50+ personas</option>
          <option value="80">80+ personas</option>
          <option value="100">100+ personas</option>
        </select>
      </fieldset>

      <fieldset className="directory-filters__section">
        <legend>Rango de edad</legend>
        <div className="directory-filters__edad-options">
          <label className="check-field">
            <input 
              type="radio" 
              name="edad" 
              checked={edadMin === null && edadMax === null}
              onChange={() => onEdadRange(null, null)} 
            />
            <span>Todas las edades</span>
          </label>
          <label className="check-field">
            <input 
              type="radio" 
              name="edad" 
              checked={edadMin === 1 && edadMax === 4}
              onChange={() => onEdadRange(1, 4)} 
            />
            <span>1 a 4 años</span>
          </label>
          <label className="check-field">
            <input 
              type="radio" 
              name="edad" 
              checked={edadMin === 5 && edadMax === 12}
              onChange={() => onEdadRange(5, 12)} 
            />
            <span>5 a 12 años</span>
          </label>
          <label className="check-field">
            <input 
              type="radio" 
              name="edad" 
              checked={edadMin === 13 && edadMax === 99}
              onChange={() => onEdadRange(13, 99)} 
            />
            <span>13+ años</span>
          </label>
        </div>
      </fieldset>
    </form>
  );
}
