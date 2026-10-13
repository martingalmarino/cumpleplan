import { budgetTotals } from '../../lib/planner/budget';
import { applyPurchaseOverrides, calculateFood } from '../../lib/planner/calculations';
import { presentTask } from '../../lib/planner/dates';
import { categoryLabels, servingLabels, settingLabels } from '../../lib/planner/labels';
import { formatArs, formatQty } from '../../lib/planner/money';
import type { Plan } from '../../lib/planner/types';

export function PrintSheet({ plan }: { plan: Plan }) {
  const food = calculateFood({
    children: plan.event.childrenCount,
    adults: plan.event.adultsCount,
    hours: plan.event.durationHours,
    servingStyle: plan.calculator.servingStyle,
    contingencyPercent: plan.calculator.contingencyPercent,
    shares: plan.calculator.shares,
    assumptions: plan.calculator.assumptions,
  });
  const lines = applyPurchaseOverrides(food, plan.calculator.overrides);
  const totals = budgetTotals(plan.budgetLines, plan.event);
  const shopping = plan.shoppingItems.filter((item) => !item.removedFromMenu);
  const activeBudget = plan.budgetLines.filter((line) => !line.excluded && (line.description || line.unitPriceCentavos != null || line.contractedCentavos != null));

  return (
    <article className="print-sheet">
      <h1>{plan.event.label}</h1>
      <p>Festejito · Estimación orientativa · Los cambios de este plan viven en el navegador donde lo armaste.</p>
      <p>
        {settingLabels[plan.event.setting]} · {plan.event.durationHours} horas · {plan.event.childrenCount} chicos · {plan.event.adultsCount} adultos
        {plan.event.date ? ` · ${plan.event.date}` : ''}
        {plan.event.age ? ` · ${plan.event.age} años` : ''}
      </p>
      <section>
        <h2>Comida y bebida</h2>
        <p>Estilo: {servingLabels[plan.calculator.servingStyle]}. Margen: {plan.calculator.contingencyPercent} %. Porciones equivalentes: {formatQty(food.equivalentServings)}.</p>
        {food.shareError ? <p>{food.shareError}</p> : null}
        {food.message ? <p>{food.message}</p> : null}
        {lines.length > 0 ? (
          <table>
            <thead>
              <tr><th>Ítem</th><th>Consumo</th><th>Compra</th><th>Unidad</th></tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key}>
                  <td>{line.label}{line.adjusted ? ' (ajustado)' : ''}</td>
                  <td>{formatQty(line.consumption)} {line.consumptionUnit}</td>
                  <td>{formatQty(line.purchase)}</td>
                  <td>{line.purchaseUnit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <p>Consumo de bebidas: {formatQty(food.beverageConsumptionLiters)} L. Compra en envases: {formatQty(food.beveragePurchaseLiters)} L.</p>
        <ul>
          {food.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </section>
      {activeBudget.length > 0 ? (
        <section>
          <h2>Presupuesto</h2>
          <p>Estimado: {totals.estimatedCentavos == null ? '—' : formatArs(totals.estimatedCentavos)}. Comprometido: {totals.committedCentavos == null ? '—' : formatArs(totals.committedCentavos)}. Pagado: {formatArs(totals.paidCentavos)}.</p>
          <table>
            <thead>
              <tr><th>Rubro</th><th>Descripción</th><th>Cantidad</th><th>Unidad</th></tr>
            </thead>
            <tbody>
              {activeBudget.map((line) => (
                <tr key={line.id}>
                  <td>{categoryLabels[line.category]}</td>
                  <td>{line.description}</td>
                  <td>{formatQty(line.quantity)}</td>
                  <td>{line.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
      {shopping.length > 0 ? (
        <section>
          <h2>Lista de compras</h2>
          <ul>
            {shopping.map((item) => (
              <li key={item.id}>{item.bought ? 'Comprado' : 'Pendiente'} · {item.name}: {formatQty(item.quantity)} {item.unit}{item.notes ? ` · ${item.notes}` : ''}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {plan.tasks.length > 0 ? (
        <section>
          <h2>Checklist</h2>
          <ul>
            {plan.tasks.map((task) => {
              const view = presentTask(task, plan.event.date);
              return (
                <li key={task.id}>
                  {view.status} · {task.title} · {view.timingLabel}{view.dateLabel ? ` · ${view.dateLabel}` : ''}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
