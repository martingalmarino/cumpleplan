import { budgetTotals } from '../../lib/planner/budget';
import { checklistProgress } from '../../lib/planner/checklist';
import { calculateFood } from '../../lib/planner/calculations';
import { settingLabels } from '../../lib/planner/labels';
import { formatArs, formatQty } from '../../lib/planner/money';
import { track } from '../../lib/analytics';
import type { Plan } from '../../lib/planner/types';

export function SummaryCard({ plan }: { plan: Plan }) {
  const food = calculateFood({
    children: plan.event.childrenCount,
    adults: plan.event.adultsCount,
    hours: plan.event.durationHours,
    servingStyle: plan.calculator.servingStyle,
    contingencyPercent: plan.calculator.contingencyPercent,
    shares: plan.calculator.shares,
    assumptions: plan.calculator.assumptions,
  });
  const totals = budgetTotals(plan.budgetLines, plan.event);
  const progress = checklistProgress(plan.tasks);
  const people = plan.event.childrenCount + plan.event.adultsCount;

  return (
    <aside className="summary-card" aria-label="Resumen del plan">
      <h2>Resumen</h2>
      <p><strong>{plan.event.label}</strong></p>
      <p className="hint">
        {settingLabels[plan.event.setting]} · {plan.event.durationHours} h · {people} asistentes
      </p>
      <p>
        Compras estimadas: {food.zeroAttendees || food.shareError ? 'incompletas' : `${formatQty(food.lines.reduce((sum, line) => sum + (line.purchase > 0 ? 1 : 0), 0))} ítems`}
      </p>
      <p className="money">
        Comprometido: {totals.committedCentavos == null ? '—' : formatArs(totals.committedCentavos)}
      </p>
      <p>
        Checklist: {progress.done} de {progress.total}
      </p>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${progress.ratio * 100}%` }} />
      </div>
      <div className="inline-actions">
        <button
          type="button"
          className="button-quiet"
          onClick={() => {
            track('print_clicked', { tool: 'resumen' });
            window.print();
          }}
        >
          Imprimir / guardar como PDF
        </button>
      </div>
      <p className="hint">El PDF se guarda desde el cuadro de impresión del navegador. No es una descarga automática.</p>
    </aside>
  );
}
