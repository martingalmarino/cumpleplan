import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProviderCategory, ProviderRecord } from '../../data/providers/records';
import { categoryCounts, filterProviders } from '../../data/providers/selectors';
import { DirectoryFilters } from './DirectoryFilters';
import { ProviderCard } from './ProviderCard';

/** La página agrega esta clase antes de pintar si la URL trae filtros, para no mostrar resultados que después desaparecen. */
const filteringClass = 'directory-filtering';

type FilterState = { 
  query: string; 
  whatsappOnly: boolean;
  zona: string | null;
  capacidadMin: number | null;
  edadMin: number | null;
  edadMax: number | null;
};

const emptyFilter: FilterState = { 
  query: '', 
  whatsappOnly: false,
  zona: null,
  capacidadMin: null,
  edadMin: null,
  edadMax: null,
};

function readUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') ?? '',
    whatsappOnly: params.get('whatsapp') === '1',
    zona: params.get('zona') || null,
    capacidadMin: params.get('cap') ? parseInt(params.get('cap')!, 10) : null,
    edadMin: params.get('edadMin') ? parseInt(params.get('edadMin')!, 10) : null,
    edadMax: params.get('edadMax') ? parseInt(params.get('edadMax')!, 10) : null,
  };
}

function writeUrl(state: FilterState) {
  const url = new URL(window.location.href);
  const set = (key: string, value: string | null) => (value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
  set('q', state.query.trim() || null);
  set('whatsapp', state.whatsappOnly ? '1' : null);
  set('zona', state.zona);
  set('cap', state.capacidadMin ? String(state.capacidadMin) : null);
  set('edadMin', state.edadMin ? String(state.edadMin) : null);
  set('edadMax', state.edadMax ? String(state.edadMax) : null);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}

function resultLabel(count: number, filtered: boolean): string {
  if (filtered) return count === 1 ? '1 salón encontrado' : `${count} salones encontrados`;
  return count === 1 ? '1 salón disponible' : `${count} salones disponibles`;
}

interface DirectoryBrowserProps {
  providers: ProviderRecord[];
  province?: string;
  city?: string;
  category?: ProviderCategory;
}

export default function DirectoryBrowser({ providers, province, city, category: preselectedCategory }: DirectoryBrowserProps) {
  const [state, setState] = useState<FilterState>(emptyFilter);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const firstAnnouncement = useRef(true);

  useEffect(() => {
    setState(readUrl());
    setReady(true);
    const onPop = () => setState(readUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.remove(filteringClass);
    writeUrl(state);
  }, [ready, state]);

  const counts = useMemo(() => categoryCounts(providers), [providers]);
  
  // Extended filtering
  let results = filterProviders(providers, { ...state, category: preselectedCategory ?? null });
  
  // Filter by zona if selected
  if (state.zona) {
    results = results.filter(p => p.locality === state.zona || p.neighborhood === state.zona);
  }
  
  // Filter by capacidad minima
  if (state.capacidadMin) {
    results = results.filter(p => {
      if (!p.capacity) return false;
      const capacityMatch = p.capacity.match(/\d+/);
      if (!capacityMatch) return false;
      const capacity = parseInt(capacityMatch[0], 10);
      return capacity >= state.capacidadMin!;
    });
  }
  
  // Filter by edad range
  if (state.edadMin !== null || state.edadMax !== null) {
    results = results.filter(p => {
      if (!p.ageRange) return false;
      const ageMatch = p.ageRange.match(/(\d+)\s*a\s*(\d+)/i);
      if (!ageMatch) return false;
      const ageMin = parseInt(ageMatch[1], 10);
      const ageMax = parseInt(ageMatch[2], 10);
      if (state.edadMin !== null && ageMax < state.edadMin) return false;
      if (state.edadMax !== null && ageMin > state.edadMax) return false;
      return true;
    });
  }

  const filtered = state.query.trim() !== '' || state.whatsappOnly || state.zona || state.capacidadMin || state.edadMin || state.edadMax;
  const label = resultLabel(results.length, filtered);

  useEffect(() => {
    if (firstAnnouncement.current) {
      firstAnnouncement.current = false;
      return;
    }
    const timer = window.setTimeout(() => setAnnouncement(label), 600);
    return () => window.clearTimeout(timer);
  }, [label]);

  const clear = () => setState(emptyFilter);

  // Get unique zonas with counts
  const zonasWithCounts = useMemo(() => {
    const zonaMap = new Map<string, number>();
    providers.forEach(p => {
      const zona = p.neighborhood || p.locality;
      if (zona) {
        zonaMap.set(zona, (zonaMap.get(zona) || 0) + 1);
      }
    });
    return Array.from(zonaMap.entries())
      .map(([zona, count]) => ({ zona, count }))
      .sort((a, b) => b.count - a.count);
  }, [providers]);

  return (
    <div className="directory-layout">
      <button 
        type="button" 
        className="directory-filters-toggle" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
      >
        Filtros {sidebarOpen ? '✕' : '☰'}
      </button>
      
      <aside className={`directory-sidebar ${sidebarOpen ? 'directory-sidebar--open' : ''}`}>
        <DirectoryFilters
          query={state.query}
          category={preselectedCategory ?? null}
          whatsappOnly={state.whatsappOnly}
          zona={state.zona}
          capacidadMin={state.capacidadMin}
          edadMin={state.edadMin}
          edadMax={state.edadMax}
          total={providers.length}
          counts={counts}
          zonasWithCounts={zonasWithCounts}
          province={province}
          city={city}
          onQuery={(query) => setState((current) => ({ ...current, query }))}
          onWhatsapp={(whatsappOnly) => setState((current) => ({ ...current, whatsappOnly }))}
          onZona={(zona) => setState((current) => ({ ...current, zona }))}
          onCapacidad={(capacidadMin) => setState((current) => ({ ...current, capacidadMin }))}
          onEdadRange={(edadMin, edadMax) => setState((current) => ({ ...current, edadMin, edadMax }))}
        />
      </aside>

      <section className="directory-results" aria-labelledby="directory-results-title">
        <div className="directory-results__header">
          <h2 id="directory-results-title">{label}</h2>
          <div className="directory-results__controls">
            <label htmlFor="sort-select" className="visually-hidden">Ordenar por</label>
            <select id="sort-select" className="directory-results__sort">
              <option value="name">Ordenar: Alfabético</option>
            </select>
          </div>
          {filtered && (
            <button type="button" className="button-quiet directory-results__clear" onClick={clear}>
              Limpiar filtros
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="directory-empty">
            <p>No encontramos opciones con esos filtros.</p>
            <button type="button" className="button button-secondary" onClick={clear}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ul className="provider-list">
            {results.map((provider) => (
              <li key={provider.id}>
                <ProviderCard provider={provider} variant="horizontal" />
              </li>
            ))}
          </ul>
        )}
      </section>
      
      <p className="visually-hidden" aria-live="polite">{announcement}</p>
    </div>
  );
}
