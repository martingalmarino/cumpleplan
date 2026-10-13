import { useMemo, useState } from 'react';
import { track } from '../../lib/analytics';
import { applyPurchaseOverrides, calculateFood } from '../../lib/planner/calculations';
import { createId } from '../../lib/planner/ids';
import { categoryLabels, categoryOrder } from '../../lib/planner/labels';
import { formatQty } from '../../lib/planner/money';
import { applyShoppingSync, generatedFromLines, previewShoppingSync, shoppingPlainText, upsertBudgetFromShopping } from '../../lib/planner/shopping';
import { updatePlan } from '../../lib/planner/store';
import type { BudgetCategory, Plan } from '../../lib/planner/types';

export function ShoppingPlanner({ plan }: { plan: Plan }) {
  const [previewing, setPreviewing] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [copyFallback, setCopyFallback] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('descartables');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unidad');
  const [error, setError] = useState<string | null>(null);

  const generated = useMemo(() => {
    const computation = calculateFood({
      children: plan.event.childrenCount,
      adults: plan.event.adultsCount,
      hours: plan.event.durationHours,
      servingStyle: plan.calculator.servingStyle,
      contingencyPercent: plan.calculator.contingencyPercent,
      shares: plan.calculator.shares,
      assumptions: plan.calculator.assumptions,
    });
    return generatedFromLines(applyPurchaseOverrides(computation, plan.calculator.overrides));
  }, [plan]);
  const changes = previewShoppingSync(plan.shoppingItems, generated);
  const visible = plan.shoppingItems.filter((item) => !item.removedFromMenu && (!onlyPending || !item.bought));

  async function copyList() {
    const text = shoppingPlainText(plan.shoppingItems);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback(null);
    } catch {
      setCopyFallback(text);
    }
  }

  return (
    <div className="stack">
      <h2>Lista de compras</h2>
      <p className="hint">Los cambios se guardan en tu plan de este navegador. La lista toma las cantidades de compra, no arma otro total de dinero.</p>
      <div className="inline-actions">
        <button type="button" className="button button-primary" onClick={() => setPreviewing(true)}>Ver cambios del cálculo</button>
        <button type="button" className="button-quiet" onClick={() => void copyList()}>Copiar texto</button>
        <label>
          <input type="checkbox" checked={onlyPending} onChange={(input) => setOnlyPending(input.target.checked)} /> Solo pendientes
        </label>
      </div>
      {copyFallback ? (
        <div className="field">
          <label htmlFor="copy-fallback">No se pudo copiar solo. Seleccioná este texto y copialo a mano.</label>
          <textarea id="copy-fallback" readOnly value={copyFallback} />
        </div>
      ) : null}
      {previewing ? (
        <div className="confirm-box" role="region" aria-label="Cambios antes de actualizar la lista">
          {changes.length === 0 ? <p>La lista ya coincide con el cálculo. No se agregan filas repetidas.</p> : (
            <ul>
              {changes.map((change) => (
                <li key={`${change.type}-${change.sourceId}`}>
                  {change.type === 'add' && `Sumar ${change.name}: ${formatQty(change.quantity)} ${change.unit}`}
                  {change.type === 'update' && `${change.name}: pasa de ${formatQty(change.fromQuantity)} a ${formatQty(change.toQuantity)} ${change.unit}`}
                  {change.type === 'review-removal' && `${change.name}: ya no está en el cálculo. Como tiene notas o avances, queda para revisar.`}
                  {change.type === 'remove' && `Quitar ${change.name}, porque nadie lo editó.`}
                </li>
              ))}
            </ul>
          )}
          <div className="inline-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                updatePlan((current) => ({
                  ...current,
                  shoppingItems: applyShoppingSync(current.shoppingItems, generated, () => createId('shop')),
                }));
                setPreviewing(false);
                track('shopping_list_generated', { tool: 'compras' });
              }}
            >
              Actualizar lista
            </button>
            <button type="button" className="button-quiet" onClick={() => setPreviewing(false)}>Cancelar</button>
          </div>
        </div>
      ) : null}

      {plan.shoppingItems.filter((item) => item.removedFromMenu).map((item) => (
        <div className="banner warning" key={item.id}>
          <strong>Revisar: {item.name} ya no está en el menú.</strong>
          <p>No lo borramos porque tenía notas, un avance o un gasto vinculado.</p>
          <button
            type="button"
            className="button-danger"
            onClick={() => updatePlan((current) => ({ ...current, shoppingItems: current.shoppingItems.filter((entry) => entry.id !== item.id) }))}
          >
            Borrar este ítem
          </button>
        </div>
      ))}

      {visible.length === 0 ? <p>Todavía no hay ítems activos. Actualizá la lista desde el cálculo o agregá algo a mano.</p> : null}
      {categoryOrder.map((group) => {
        const items = visible.filter((item) => item.category === group);
        if (items.length === 0) return null;
        return (
          <section key={group}>
            <h3 className="group-label">{categoryLabels[group]}</h3>
            {items.map((item) => (
              <article className="shop-row" key={item.id}>
                <input
                  id={`bought-${item.id}`}
                  type="checkbox"
                  checked={item.bought}
                  onChange={(input) =>
                    updatePlan((current) => ({
                      ...current,
                      shoppingItems: current.shoppingItems.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              bought: input.target.checked,
                              purchasedQuantity: input.target.checked ? entry.quantity : entry.purchasedQuantity,
                              userEdited: true,
                              reviewFlag: input.target.checked ? null : entry.reviewFlag,
                            }
                          : entry,
                      ),
                    }))
                  }
                />
                <div>
                  <label htmlFor={`bought-${item.id}`}><strong>{item.name}</strong> · {formatQty(item.quantity)} {item.unit}</label>
                  {item.reviewFlag === 'quantity-changed' ? (
                    <p className="field-error">Revisar: cambió la cantidad. Compraste {formatQty(item.purchasedQuantity)} de {formatQty(item.quantity)}. No damos por comprado lo que falta.</p>
                  ) : null}
                  {item.linkedBudgetLineId ? <p className="hint">Vinculado al presupuesto. El importe se edita ahí, no en esta lista.</p> : null}
                  <div className="field">
                    <label htmlFor={`note-${item.id}`}>Nota</label>
                    <input
                      id={`note-${item.id}`}
                      value={item.notes}
                      onChange={(input) =>
                        updatePlan((current) => ({
                          ...current,
                          shoppingItems: current.shoppingItems.map((entry) => entry.id === item.id ? { ...entry, notes: input.target.value.slice(0, 500), userEdited: true } : entry),
                        }))
                      }
                    />
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="button-quiet"
                      onClick={() =>
                        updatePlan((current) => {
                          const source = current.shoppingItems.find((entry) => entry.id === item.id);
                          if (!source) return current;
                          const result = upsertBudgetFromShopping(current.budgetLines, source, () => createId('budget'));
                          return {
                            ...current,
                            budgetLines: result.lines,
                            shoppingItems: current.shoppingItems.map((entry) => entry.id === item.id ? { ...entry, linkedBudgetLineId: result.lineId, userEdited: true } : entry),
                          };
                        })
                      }
                    >
                      Pasar al presupuesto
                    </button>
                    {item.sourceId == null ? (
                      <button
                        type="button"
                        className="button-danger"
                        onClick={() => updatePlan((current) => ({ ...current, shoppingItems: current.shoppingItems.filter((entry) => entry.id !== item.id) }))}
                      >
                        Borrar
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        );
      })}

      <form
        className="stack"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          const parsed = Number(quantity.replace(',', '.'));
          if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0) {
            setError('Completá nombre y una cantidad mayor a cero.');
            return;
          }
          setError(null);
          updatePlan((current) => ({
            ...current,
            shoppingItems: [
              ...current.shoppingItems,
              {
                id: createId('shop'),
                sourceId: null,
                category,
                name: name.trim(),
                quantity: parsed,
                unit: unit.trim() || 'unidad',
                purchasedQuantity: 0,
                bought: false,
                notes: '',
                linkedBudgetLineId: null,
                reviewFlag: null,
                removedFromMenu: false,
                userEdited: true,
              },
            ],
          }));
          setName('');
        }}
      >
        <h3>Agregar a mano</h3>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="shop-name">Nombre</label>
            <input id="shop-name" value={name} onChange={(input) => setName(input.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="shop-category">Rubro</label>
            <select id="shop-category" value={category} onChange={(input) => setCategory(input.target.value as BudgetCategory)}>
              {categoryOrder.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="shop-qty">Cantidad</label>
            <input id="shop-qty" inputMode="decimal" value={quantity} onChange={(input) => setQuantity(input.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="shop-unit">Unidad</label>
            <input id="shop-unit" value={unit} onChange={(input) => setUnit(input.target.value)} />
          </div>
        </div>
        {error ? <p className="field-error">{error}</p> : null}
        <button type="submit" className="button button-secondary">Agregar ítem</button>
      </form>
    </div>
  );
}
