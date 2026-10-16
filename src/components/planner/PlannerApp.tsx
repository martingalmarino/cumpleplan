import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '../icons/Icon';
import { toolLinks } from '../../lib/planner/labels';
import { BudgetPlanner } from './BudgetPlanner';
import { ChecklistPlanner } from './ChecklistPlanner';
import { EventForm } from './EventForm';
import { FoodCalculator } from './FoodCalculator';
import { ImportSharedPlan } from './ImportSharedPlan';
import { Notices } from './Notices';
import { PrintSheet } from './PrintSheet';
import { ResetPlan } from './ResetPlan';
import { SharePlan } from './SharePlan';
import { ShoppingPlanner } from './ShoppingPlanner';
import { SummaryCard } from './SummaryCard';
import { usePlanner } from './usePlanner';

import type { Plan } from '../../lib/planner/types';

export type PlannerView = 'resumen' | 'comida' | 'presupuesto' | 'checklist' | 'compras';

const toolIcons: Record<PlannerView, IconName> = {
  resumen: 'home',
  comida: 'utensils',
  presupuesto: 'wallet',
  checklist: 'check',
  compras: 'bag',
};

type Props = {
  view: PlannerView;
  mode?: 'dashboard' | 'embedded';
  /** Plan inicial para SSR (usado solo en el servidor para crawlers) */
  ssrPlan?: Plan;
};

export default function PlannerApp({ view, mode = 'embedded', ssrPlan }: Props) {
  const snapshot = usePlanner();
  const [dashboardView, setDashboardView] = useState<PlannerView>(view);
  const active = mode === 'dashboard' ? dashboardView : view;

  // En SSR, usar el plan provisto. En el cliente, esperar hasta que se cargue.
  const isSSR = typeof window === 'undefined';
  const plan = isSSR && ssrPlan ? ssrPlan : snapshot.plan;
  const ready = isSSR ? true : snapshot.ready;
  
  if (!ready) {
    return <div className="planner-main loading-block" role="status">Cargando tu plan de este navegador…</div>;
  }

  const blocked = !isSSR && snapshot.loadIssue?.kind === 'future';

  return (
    <>
      {!isSSR && <ImportSharedPlan hasExistingPlan={!snapshot.wasEmpty} />}
      <div className="planner no-print" suppressHydrationWarning>
        <div className={`planner-main tool-${active}`} suppressHydrationWarning>
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
            {mode === 'dashboard' ? null : <a href="/organizador/"><Icon name="home" /> Plan completo</a>}
          </nav>
          <Notices snapshot={snapshot} />
          {blocked ? null : (
            <>
              {(active === 'resumen' || active === 'comida' || active === 'presupuesto' || active === 'checklist') && <EventForm plan={plan} />}
              {active === 'resumen' ? (
                <>
                  <p>Desde acá corregís los datos del festejo. La comida, el presupuesto, la checklist y las compras usan este mismo plan.</p>
                  <SharePlan plan={plan} />
                </>
              ) : null}
              {active === 'comida' ? <FoodCalculator plan={plan} /> : null}
              {active === 'presupuesto' ? <BudgetPlanner plan={plan} /> : null}
              {active === 'checklist' ? <ChecklistPlanner plan={plan} /> : null}
              {active === 'compras' ? <ShoppingPlanner plan={plan} /> : null}
              {active === 'resumen' ? <ResetPlan /> : null}
            </>
          )}
        </div>
        <SummaryCard plan={plan} />
      </div>
      {typeof document !== 'undefined' ? createPortal(<PrintSheet plan={plan} />, document.body) : null}
    </>
  );
}
