import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProviderCategory, ProviderRecord } from '../../data/providers/records';
import { categoryCounts, filterProviders } from '../../data/providers/selectors';
import { DirectoryFilters } from './DirectoryFilters';
import { ProviderCard } from './ProviderCard';

/** La página agrega esta clase antes de pintar si la URL trae filtros, para no mostrar resultados que después desaparecen. */
const filteringClass = 'directory-filtering';

type FilterState = { query: string; whatsappOnly: boolean };

const emptyFilter: FilterState = { query: '', whatsappOnly: false };

function readUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get('q') ?? '',
    whatsappOnly: params.get('whatsapp') === '1',
  };
}

function writeUrl(state: FilterState) {
  const url = new URL(window.location.href);
  const set = (key: string, value: string | null) => (value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
  set('q', state.query.trim() || null);
  set('whatsapp', state.whatsappOnly ? '1' : null);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}

function resultLabel(count: number, filtered: boolean): string {
  if (filtered) return count === 1 ? '1 opción encontrada' : `${count} opciones encontradas`;
  return count === 1 ? '1 opción disponible' : `${count} opciones disponibles`;
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
  const results = filterProviders(providers, { ...state, category: preselectedCategory ?? null });
  const filtered = state.query.trim() !== '' || state.whatsappOnly;
  const label = resultLabel(results.length, filtered);

  useEffect(() => {
    if (firstAnnouncement.current) {
      firstAnnouncement.current = false;
      return;
    }
    const timer = window.setTimeout(() => setAnnouncement(label), 600);
    return () => window.clearTimeout(timer);
  }, [label]);

  const active = [
    state.query.trim() ? `"${state.query.trim()}"` : null,
    state.whatsappOnly ? 'con WhatsApp' : null,
  ].filter(Boolean);

  const clear = () => setState(emptyFilter);

  return (
    <div className="directory">
      <DirectoryFilters
        query={state.query}
        category={preselectedCategory ?? null}
        whatsappOnly={state.whatsappOnly}
        total={providers.length}
        counts={counts}
        province={province}
        city={city}
        onQuery={(query) => setState((current) => ({ ...current, query }))}
        onWhatsapp={(whatsappOnly) => setState((current) => ({ ...current, whatsappOnly }))}
      />

      <section className="directory-results" aria-labelledby="directory-results-title">
        <div className="directory-results__header">
          <h2 id="directory-results-title">{label}</h2>
          <span className="directory-results__order">Orden alfabético</span>
          {filtered ? (
            <button type="button" className="button-quiet directory-results__clear" onClick={clear}>
              Limpiar filtros
            </button>
          ) : null}
        </div>
        {active.length > 0 ? <p className="directory-results__active">Filtrando por {active.join(' · ')}</p> : null}
        <p className="visually-hidden" aria-live="polite">{announcement}</p>

        {results.length === 0 ? (
          <div className="directory-empty">
            <p>No encontramos opciones con esos filtros.</p>
            <button type="button" className="button button-secondary" onClick={clear}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ul className="provider-grid">
            {results.map((provider) => (
              <li key={provider.id}>
                <ProviderCard provider={provider} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
