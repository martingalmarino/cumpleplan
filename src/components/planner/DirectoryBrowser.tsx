import { useMemo, useState } from 'react';
import type { ProviderRecord } from '../../data/providers/records';

export default function DirectoryBrowser({ providers }: { providers: ProviderRecord[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todas');
  const categories = useMemo(() => {
    const labels = new Map<string, string>();
    for (const provider of providers) {
      for (const item of provider.categories) labels.set(item, categoryLabel(item));
    }
    return [...labels.entries()];
  }, [providers]);
  const filtered = providers.filter((provider) => {
    const haystack = `${provider.name} ${provider.neighborhood ?? ''} ${provider.description}`.toLocaleLowerCase('es');
    const matchesQuery = haystack.includes(query.trim().toLocaleLowerCase('es'));
    const matchesCategory = category === 'todas' || provider.categories.includes(category as ProviderRecord['categories'][number]);
    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <div className="filters">
        <div className="field">
          <label htmlFor="provider-search">Buscar</label>
          <input id="provider-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o barrio" />
        </div>
        <div className="field">
          <label htmlFor="provider-category">Rubro</label>
          <select id="provider-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="todas">Todos los rubros publicados</option>
            {categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
      </div>
      <p className="hint">El filtro funciona en tu navegador. No arma páginas nuevas por barrio ni por combinación.</p>
      {filtered.length === 0 ? <p>Ningún proveedor coincide con ese filtro.</p> : null}
      <div className="card-grid">
        {filtered.map((provider) => (
          <article className="card provider-card" key={provider.id}>
            <CategoryArt category={provider.categories[0]} />
            <p className="hint">{provider.categories.map(categoryLabel).join(' · ')}</p>
            <h2>{provider.name}</h2>
            <p>{provider.neighborhood ? `${provider.neighborhood}, ` : ''}{provider.locality}</p>
            <p>{provider.description}</p>
            <p className="hint">Datos revisados el 13 de octubre de 2026.</p>
            <a href={`/cumpleanos-infantiles-cordoba/proveedores/${provider.slug}/`}>Ver datos de contacto</a>
          </article>
        ))}
      </div>
    </div>
  );
}

function categoryLabel(id: string): string {
  if (id === 'salones') return 'Salones';
  if (id === 'animacion') return 'Animación';
  if (id === 'tortas-catering') return 'Tortas y catering';
  return 'Decoración y alquileres';
}

function CategoryArt({ category }: { category: string }) {
  const color = category === 'salones' ? '#EDF3FF' : category === 'tortas-catering' ? '#FFF0E8' : '#FFF7D9';
  return (
    <svg className="illustration" viewBox="0 0 320 92" role="img" aria-label="Ilustración genérica, no es una foto del lugar">
      <rect width="320" height="92" fill={color} />
      <circle cx="46" cy="46" r="18" fill="#FFFFFF" />
      <rect x="78" y="28" width="180" height="10" rx="5" fill="#FFFFFF" />
      <rect x="78" y="48" width="120" height="8" rx="4" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}
