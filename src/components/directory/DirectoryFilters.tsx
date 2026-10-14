import type { ProviderCategory } from '../../data/providers/records';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  query: string;
  category: ProviderCategory | null;
  whatsappOnly: boolean;
  total: number;
  counts: { id: ProviderCategory; label: string; count: number }[];
  onQuery: (value: string) => void;
  onCategory: (value: ProviderCategory | null) => void;
  onWhatsapp: (value: boolean) => void;
};

export function DirectoryFilters({ query, category, whatsappOnly, total, counts, onQuery, onCategory, onWhatsapp }: Props) {
  return (
    <form className="directory-filters" role="search" aria-label="Filtrar proveedores" onSubmit={(event) => event.preventDefault()}>
      <div className="field directory-filters__search">
        <label htmlFor="provider-search">Buscar por nombre, barrio o servicio</label>
        <input id="provider-search" type="search" value={query} autoComplete="off" onChange={(event) => onQuery(event.target.value)} />
      </div>
      <fieldset className="directory-filters__categories">
        <legend className="visually-hidden">Rubro</legend>
        <button type="button" className="category-chip" aria-pressed={category === null} onClick={() => onCategory(null)}>
          <span>Todos</span>
          <span className="category-chip__count">{total}</span>
        </button>
        {counts.map((item) => (
          <button
            key={item.id}
            type="button"
            className="category-chip"
            aria-pressed={category === item.id}
            onClick={() => onCategory(category === item.id ? null : item.id)}
          >
            <CategoryIcon category={item.id} size="xs" />
            <span>{item.label}</span>
            <span className="category-chip__count">{item.count}</span>
          </button>
        ))}
      </fieldset>
      <label className="check-field directory-filters__whatsapp">
        <input type="checkbox" checked={whatsappOnly} onChange={(event) => onWhatsapp(event.target.checked)} />
        <span>Con WhatsApp</span>
      </label>
    </form>
  );
}
