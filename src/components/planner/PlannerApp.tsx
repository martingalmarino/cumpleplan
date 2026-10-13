import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '../icons/Icon';
import { toolLinks } from '../../lib/planner/labels';
import { BackupPanel } from './BackupPanel';
import { BudgetPlanner } from './BudgetPlanner';
import { ChecklistPlanner } from './ChecklistPlanner';
import { EventForm } from './EventForm';
import { FoodCalculator } from './FoodCalculator';
import { Notices } from './Notices';
import { PrintSheet } from './PrintSheet';
import { ShoppingPlanner } from './ShoppingPlanner';
import { SummaryCard } from './SummaryCard';
import { usePlanner } from './usePlanner';

export type PlannerView = 'resumen' | 'comida' | 'presupuesto' | 'checklist' | 'compras' | 'respaldo';

const toolIcons: Record<PlannerView, IconName> = {
  resumen: 'home',
  comida: 'utensils',
  presupuesto: 'wallet',
  checklist: 'check',
  compras: 'bag',
  respaldo: 'download',
};

export default function PlannerApp({ view, mode = 'embedded' }: { view: PlannerView; mode?: 'dashboard' | 'embedded' }) {
  const snapshot = usePlanner();
  const [dashboardView, setDashboardView] = useState<PlannerView>(view);
  const active = mode === 'dashboard' ? dashboardView : view;

  if (!snapshot.ready) {
    return <div className="planner-main loading-block" role="status">Cargando tu plan de este navegador…</div>;
  }

  const plan = snapshot.plan;
  const blocked = snapshot.loadIssue?.kind === 'future';

  return (
    <>
      <div className="planner no-print">
        <div className={`planner-main tool-${active}`}>
          <nav className="tool-nav" aria-label="Herramientas del plan">
            {toolLinks.map((link) =>
              mode === 'dashboard' ? (
                <button key={link.view} type="button" aria-current={active === link.view ? 'page' : undefined} onClick={() => setDashboardView(link.view)}>
                  <Icon name={toolIcons[link.view]} /> {link.label}
                </button>
              ) : (
                <a key={link.href} href={link.href} aria-current={view === link.view ? 'page' : undefined}><Icon name={toolIcons[link.view]} /> {link.label}</a>
              ),
            )}
            {mode === 'dashboard' ? (
              <button type="button" aria-current={active === 'respaldo' ? 'page' : undefined} onClick={() => setDashboardView('respaldo')}><Icon name="download" /> Respaldo</button>
            ) : (
              <a href="/organizador/"><Icon name="home" /> Plan completo</a>
            )}
          </nav>
          <Notices snapshot={snapshot} />
          {blocked ? null : (
            <>
              {(active === 'resumen' || active === 'comida' || active === 'presupuesto' || active === 'checklist') && <EventForm plan={plan} />}
              {active === 'resumen' ? (
                <p>Desde acá corregís los datos del festejo. La comida, el presupuesto, la checklist y las compras usan este mismo plan.</p>
              ) : null}
              {active === 'comida' ? <FoodCalculator plan={plan} /> : null}
              {active === 'presupuesto' ? <BudgetPlanner plan={plan} /> : null}
              {active === 'checklist' ? <ChecklistPlanner plan={plan} /> : null}
              {active === 'compras' ? <ShoppingPlanner plan={plan} /> : null}
              {active === 'respaldo' || active === 'resumen' ? <BackupPanel plan={plan} /> : null}
            </>
          )}
        </div>
        <SummaryCard plan={plan} />
      </div>
      {typeof document !== 'undefined' ? createPortal(<PrintSheet plan={plan} />, document.body) : null}
    </>
  );
}
