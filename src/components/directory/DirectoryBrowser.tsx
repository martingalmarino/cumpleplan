import { useEffect, useMemo, useState } from 'react';
import { categoryLabel, providerCategories, type ProviderCategory, type ProviderRecord } from '../../data/providers/records';
import { CategoryIcon } from './CategoryIcon';
import { ProviderRow } from './ProviderRow';

type CategoryFilter = ProviderCategory | 'todas';

const categoryIds = providerCategories.map((item) => item.id) as readonly string[];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');
}

function isCategory(value: string | null): value is ProviderCategory {
  return value !== null && categoryIds.includes(value);
}

function syncUrl(category: CategoryFilter) {
  const url = new URL(window.location.href);
  if (category === 'todas') url.searchParams.delete('rubro');
  else url.searchParams.set('rubro', category);
  window.history.replaceState(null, '', url);
}

export default function DirectoryBrowser({ providers }: { providers: ProviderRecord[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('todas');
  const [onlyWhatsapp, setOnlyWhatsapp] = useState(false);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('rubro');
    if (isCategory(initial)) setCategory(initial);
  }, []);

  const sorted = useMemo(() => [...providers].sort((a, b) => a.name.localeCompare(b.name, 'es')), [providers]);

  const counts = useMemo(
    () =>
      providerCategories
        .map((item) => ({ ...item, count: providers.filter((provider) => provider.categories.includes(item.id)).length }))
        .filter((item) => item.count > 0),
    [providers],
  );

  const needle = normalize(query.trim());
  const filtered = sorted.filter((provider) => {
    const haystack = normalize(
      [provider.name, provider.neighborhood, provider.address, provider.summary, ...(provider.services ?? []), ...provider.categories.map(categoryLabel)]
        .filter(Boolean)
        .join(' '),
    );
    if (needle && !haystack.includes(needle)) return false;
    if (category !== 'todas' && !provider.categories.includes(category)) return false;
    if (onlyWhatsapp && !provider.whatsappUrl) return false;
    return true;
  });

  const hasFilters = needle.length > 0 || category !== 'todas' || onlyWhatsapp;

  function chooseCategory(next: CategoryFilter) {
    setCategory(next);
    syncUrl(next);
  }

  function clearFilters() {
    setQuery('');
    setOnlyWhatsapp(false);
    chooseCategory('todas');
  }

  return (
    <div className="directory">
      <nav className="category-shortcuts" aria-label="Rubros del directorio">
        <ul>
          {counts.map((item) => (
            <li key={item.id}>
              <a
                href={`?rubro=${item.id}#listado`}
                aria-current={category === item.id ? 'true' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  chooseCategory(category === item.id ? 'todas' : item.id);
                  document.getElementById('listado')?.scrollIntoView({ block: 'start' });
                }}
              >
                <CategoryIcon category={item.id} size="sm" />
                <span className="category-shortcuts__label">{item.label}</span>
                <span className="category-shortcuts__count">{item.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="listado" className="directory-list" aria-labelledby="directory-results">
        <form className="directory-filters" role="search" onSubmit={(event) => event.preventDefault()}>
          <div className="field">
            <label htmlFor="provider-search">Buscar</label>
            <input
              id="provider-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, barrio o servicio"
            />
          </div>
          <div className="field">
            <label htmlFor="provider-category">Rubro</label>
            <select id="provider-category" value={category} onChange={(event) => chooseCategory(event.target.value as CategoryFilter)}>
              <option value="todas">Todos los rubros ({providers.length})</option>
              {counts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.count})
                </option>
              ))}
            </select>
          </div>
          <label className="check-field">
            <input type="checkbox" checked={onlyWhatsapp} onChange={(event) => setOnlyWhatsapp(event.target.checked)} />
            <span>Con WhatsApp</span>
          </label>
        </form>

        <div className="directory-list__header">
          <h2 id="directory-results" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'proveedor' : 'proveedores'} · orden alfabético
          </h2>
          {hasFilters ? (
            <button type="button" className="button-quiet" onClick={clearFilters}>
              Limpiar filtros
            </button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <div className="directory-empty">
            <p>Ningún proveedor coincide con esos filtros.</p>
            <button type="button" className="button button-secondary" onClick={clearFilters}>
              Ver todos los proveedores
            </button>
          </div>
        ) : (
          <ol className="provider-rows">
            {filtered.map((provider) => (
              <li key={provider.id}>
                <ProviderRow provider={provider} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
