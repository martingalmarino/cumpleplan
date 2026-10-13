import { useState } from 'react';
import { track } from '../../lib/analytics';
import {
  applicablePeople,
  blankBudgetLine,
  budgetTotals,
  cheapestQuoteIds,
  lineCommittedCentavos,
  lineEstimateCentavos,
  linePendingCentavos,
  paymentError,
  quoteTotal,
} from '../../lib/planner/budget';
import { createId } from '../../lib/planner/ids';
import { categoryLabels, categoryOrder } from '../../lib/planner/labels';
import { formatArs } from '../../lib/planner/money';
import { applyQuoteSelection, restoreBudgetLine } from '../../lib/planner/mutate';
import { updatePlan } from '../../lib/planner/store';
import type { BudgetCategory, BudgetLine, Plan, Quote, QuoteAppliesTo } from '../../lib/planner/types';
import { MoneyField, TextField } from './fields';

function moneyText(value: number | null, empty = '—'): string {
  return value == null ? empty : formatArs(value);
}

export function BudgetPlanner({ plan }: { plan: Plan }) {
  const [category, setCategory] = useState<BudgetCategory>('otros');
  const [applyId, setApplyId] = useState<string | null>(null);
  const [applyCategory, setApplyCategory] = useState<BudgetCategory>('lugar');
  const [coveredLines, setCoveredLines] = useState<string[]>([]);
  const [coveredShopping, setCoveredShopping] = useState<string[]>([]);
  const [applyError, setApplyError] = useState<string | null>(null);
  const totals = budgetTotals(plan.budgetLines, plan.event);
  const people = plan.event.childrenCount + plan.event.adultsCount;
  const groups = new Map<string, Quote[]>();
  for (const quote of plan.quotes) {
    const list = groups.get(quote.groupId) ?? [];
    list.push(quote);
    groups.set(quote.groupId, list);
  }
  const applying = plan.quotes.find((quote) => quote.id === applyId) ?? null;
  const replacing = applying ? plan.budgetLines.find((line) => line.quoteGroupId === applying.groupId) : undefined;

  function patchLine(id: string, recipe: (line: BudgetLine) => BudgetLine) {
    updatePlan((current) => ({
      ...current,
      budgetLines: current.budgetLines.map((line) => (line.id === id ? recipe(line) : line)),
    }));
    track('budget_updated', { tool: 'presupuesto' });
  }

  function patchQuote(id: string, recipe: (quote: Quote) => Quote) {
    updatePlan((current) => ({
      ...current,
      quotes: current.quotes.map((quote) => (quote.id === id ? recipe(quote) : quote)),
    }));
  }

  return (
    <div className="stack">
      <h2>Presupuesto</h2>
      <p className="hint">Los cambios se guardan en tu plan de este navegador. Los precios los ponés vos: acá no hay valores de mercado. Usá coma para decimales, por ejemplo 1.250,50.</p>
      <div className="totals">
        <p><strong>Estimado:</strong> <span className="money">{moneyText(totals.estimatedCentavos, 'Falta ingresar precios')}</span></p>
        <p className="hint">Suma cantidad por precio unitario de las líneas que no marcaste como cubiertas.</p>
        <p><strong>Comprometido:</strong> <span className="money">{moneyText(totals.committedCentavos)}</span></p>
        <p className="hint">Usa el importe contratado si lo cargaste. Si no, usa la estimación. La seña no se suma otra vez.</p>
        <p><strong>Pagado:</strong> <span className="money">{formatArs(totals.paidCentavos)}</span></p>
        <p><strong>Pendiente de pago:</strong> <span className="money">{totals.hasContractedLine ? moneyText(totals.pendingCentavos) : '—'}</span></p>
        <p className="hint">Solo en líneas con importe contratado: contratado menos lo ya pagado.</p>
        <p>
          <strong>Por persona:</strong>{' '}
          <span className="money">{people === 0 ? '—' : moneyText(totals.perAttendeeCentavos)}</span>
        </p>
        {people === 0 ? <p className="hint">Sumá chicos o adultos para ver el costo por persona.</p> : null}
        {totals.partialEstimates ? <p className="hint">Hay líneas sin precio. El estimado usa solo las que ya cargaste.</p> : null}
        <p>
          <strong>Contra el objetivo:</strong>{' '}
          {plan.event.budgetTargetCentavos == null
            ? 'Todavía no cargaste un objetivo.'
            : totals.targetDifferenceCentavos == null
              ? 'Falta el comprometido para comparar.'
              : totals.targetDifferenceCentavos >= 0
                ? `Estás ${formatArs(totals.targetDifferenceCentavos)} por debajo del objetivo.`
                : `Superás el objetivo en ${formatArs(Math.abs(totals.targetDifferenceCentavos))}.`}
        </p>
      </div>

      {plan.budgetLines.length === 0 ? <p>Todavía no cargaste gastos. Empezá por una línea o pasá un ítem desde la lista de compras.</p> : null}
      {plan.budgetLines.map((line) => {
        const payError = paymentError(line.paidCentavos, line.contractedCentavos);
        return (
          <article className="result-line" key={line.id}>
            <header>
              <h3>{line.description || 'Gasto sin descripción'}</h3>
              <span>{categoryLabels[line.category]}</span>
            </header>
            {line.excluded ? (
              <div className="banner warning">
                <p>No suma al gasto. {line.exclusionNote || 'Lo marcaste como cubierto.'}</p>
                <button type="button" className="button-quiet" onClick={() => updatePlan((current) => restoreBudgetLine(current, line.id))}>
                  Volver a incluirlo
                </button>
              </div>
            ) : null}
            <div className="field-grid">
              <TextField label="Descripción" value={line.description} onText={(description) => patchLine(line.id, (current) => ({ ...current, description: description.slice(0, 160) }))} />
              <div className="field">
                <label htmlFor={`cat-${line.id}`}>Rubro</label>
                <select id={`cat-${line.id}`} value={line.category} onChange={(input) => patchLine(line.id, (current) => ({ ...current, category: input.target.value as BudgetCategory }))}>
                  {categoryOrder.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
                </select>
              </div>
              <QuantityEditor line={line} onCommit={(quantity) => patchLine(line.id, (current) => ({ ...current, quantity }))} />
              <TextField label="Unidad" hint="Por ejemplo: pizza, kg, envase o servicio. No mezcles porción y pizza en el mismo precio." value={line.unit} onText={(unit) => patchLine(line.id, (current) => ({ ...current, unit: unit.slice(0, 40) }))} />
              <MoneyField label="Precio unitario" value={line.unitPriceCentavos} onCommit={(unitPriceCentavos) => patchLine(line.id, (current) => ({ ...current, unitPriceCentavos }))} />
              <MoneyField label="Importe contratado" hint="Si todavía no cerraste, dejalo vacío." value={line.contractedCentavos} placeholder="Sin contrato todavía" onCommit={(contractedCentavos) => patchLine(line.id, (current) => ({ ...current, contractedCentavos }))} />
              <MoneyField
                label="Pagado, incluida la seña"
                hint="La seña cuenta como pago. No la cargues también como otro gasto."
                value={line.paidCentavos}
                placeholder="0,00"
                onCommit={(paid) => {
                  const next = paid ?? 0;
                  if (paymentError(next, line.contractedCentavos)) return;
                  patchLine(line.id, (current) => ({ ...current, paidCentavos: next }));
                }}
              />
              <TextField label="Notas" value={line.notes} onText={(notes) => patchLine(line.id, (current) => ({ ...current, notes: notes.slice(0, 500) }))} />
            </div>
            {payError ? <p className="field-error">{payError}</p> : null}
            <p className="hint">Estimado de la línea: {moneyText(lineEstimateCentavos(line), 'Ingresá tu precio')}. Comprometido: {moneyText(lineCommittedCentavos(line))}. Pendiente: {moneyText(linePendingCentavos(line))}.</p>
            <button type="button" className="button-danger" onClick={() => updatePlan((current) => ({ ...current, budgetLines: current.budgetLines.filter((item) => item.id !== line.id) }))}>
              Borrar línea
            </button>
          </article>
        );
      })}

      <form
        className="inline-actions"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          updatePlan((current) => ({ ...current, budgetLines: [...current.budgetLines, blankBudgetLine(createId('budget'), category)] }));
        }}
      >
        <div className="field">
          <label htmlFor="new-line-category">Rubro de la línea nueva</label>
          <select id="new-line-category" value={category} onChange={(input) => setCategory(input.target.value as BudgetCategory)}>
            {categoryOrder.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
          </select>
        </div>
        <button type="submit" className="button button-secondary">Agregar línea</button>
      </form>

      <section>
        <h3>Comparar alternativas del mismo servicio</h3>
        <p className="hint">Hasta tres opciones por servicio. El total es tarifa fija + por persona × cantidad que corresponda + traslado + extras. “Más económico según los importes cargados” no significa que sea el mejor.</p>
        {[...groups.entries()].map(([groupId, quotes]) => {
          const totalsByQuote = quotes.map((quote) => ({
            id: quote.id,
            totalCentavos: quoteTotal(quote, applicablePeople(quote.appliesTo, plan.event.childrenCount, plan.event.adultsCount)).totalCentavos,
          }));
          const cheap = cheapestQuoteIds(totalsByQuote);
          return (
            <div className="stack" key={groupId}>
              <TextField
                label="Servicio"
                value={quotes[0]?.serviceName ?? ''}
                onText={(serviceName) =>
                  updatePlan((current) => ({
                    ...current,
                    quotes: current.quotes.map((quote) => quote.groupId === groupId ? { ...quote, serviceName: serviceName.slice(0, 80) } : quote),
                  }))
                }
              />
              {quotes.map((quote) => {
                const math = quoteTotal(quote, applicablePeople(quote.appliesTo, plan.event.childrenCount, plan.event.adultsCount));
                return (
                  <article className="result-line" key={quote.id}>
                    <TextField label="Alternativa" value={quote.optionName} onText={(optionName) => patchQuote(quote.id, (current) => ({ ...current, optionName: optionName.slice(0, 80) }))} />
                    <div className="field-grid">
                      <MoneyField label="Tarifa fija" value={quote.fixedCentavos} placeholder="Ingresá el importe" onCommit={(fixedCentavos) => patchQuote(quote.id, (current) => ({ ...current, fixedCentavos }))} />
                      <MoneyField label="Por persona" value={quote.perPersonCentavos} placeholder="0,00 si no cobra por persona" onCommit={(perPersonCentavos) => patchQuote(quote.id, (current) => ({ ...current, perPersonCentavos }))} />
                      <div className="field">
                        <label htmlFor={`applies-${quote.id}`}>Aplica a</label>
                        <select
                          id={`applies-${quote.id}`}
                          value={quote.appliesTo ?? ''}
                          onChange={(input) => patchQuote(quote.id, (current) => ({ ...current, appliesTo: (input.target.value || null) as QuoteAppliesTo | null }))}
                        >
                          <option value="">Elegí</option>
                          <option value="children">Chicos</option>
                          <option value="adults">Adultos</option>
                          <option value="both">Chicos y adultos</option>
                        </select>
                      </div>
                      <MoneyField label="Traslado" value={quote.transportCentavos} placeholder="0,00 si no hay" onCommit={(transportCentavos) => patchQuote(quote.id, (current) => ({ ...current, transportCentavos }))} />
                      <MoneyField label="Extras" value={quote.extrasCentavos} placeholder="0,00 si no hay" onCommit={(extrasCentavos) => patchQuote(quote.id, (current) => ({ ...current, extrasCentavos }))} />
                    </div>
                    <TextField label="Qué incluye" value={quote.includedItems} onText={(includedItems) => patchQuote(quote.id, (current) => ({ ...current, includedItems: includedItems.slice(0, 500) }))} />
                    <TextField label="Qué no incluye" value={quote.exclusions} onText={(exclusions) => patchQuote(quote.id, (current) => ({ ...current, exclusions: exclusions.slice(0, 500) }))} />
                    <p className="money">Total: {math.totalCentavos == null ? 'Faltan importes' : formatArs(math.totalCentavos)}</p>
                    {math.missing.length > 0 ? <p className="hint">Falta: {math.missing.join(', ')}.</p> : null}
                    {cheap.includes(quote.id) ? <p><span className="tag">Más económico según los importes cargados</span></p> : null}
                    <div className="inline-actions">
                      <button type="button" className="button button-primary" onClick={() => { setApplyId(quote.id); setApplyError(null); setCoveredLines([]); setCoveredShopping([]); }}>
                        Usar en el presupuesto
                      </button>
                      <button type="button" className="button-danger" onClick={() => updatePlan((current) => ({ ...current, quotes: current.quotes.filter((item) => item.id !== quote.id) }))}>
                        Quitar alternativa
                      </button>
                    </div>
                  </article>
                );
              })}
              {quotes.length < 3 ? (
                <button
                  type="button"
                  className="button-quiet"
                  onClick={() =>
                    updatePlan((current) => ({
                      ...current,
                      quotes: [...current.quotes, blankQuote(groupId, quotes[0]?.serviceName ?? '')],
                    }))
                  }
                >
                  Agregar alternativa
                </button>
              ) : <p className="hint">Este servicio ya tiene tres alternativas.</p>}
            </div>
          );
        })}
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            const groupId = createId('group');
            updatePlan((current) => ({ ...current, quotes: [...current.quotes, blankQuote(groupId, '')] }));
          }}
        >
          Comparar un servicio
        </button>
      </section>

      {applying ? (
        <div className="confirm-box" role="alertdialog" aria-labelledby="apply-title">
          <h3 id="apply-title">Confirmar línea de presupuesto</h3>
          <p>
            {replacing
              ? `Se va a reemplazar “${replacing.description || 'la línea de este servicio'}”. El pago ya cargado se conserva si no supera el nuevo importe.`
              : `Se va a crear una línea para “${applying.serviceName || 'servicio'} — ${applying.optionName || 'alternativa'}”.`}
            {' '}Las otras alternativas quedan como comparación y no suman al gasto.
          </p>
          <div className="field">
            <label htmlFor="apply-category">Rubro de la línea</label>
            <select id="apply-category" value={applyCategory} onChange={(input) => setApplyCategory(input.target.value as BudgetCategory)}>
              {categoryOrder.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
            </select>
          </div>
          <fieldset>
            <legend>¿Qué gastos ya están cubiertos por esta alternativa?</legend>
            <p className="hint">No borramos compras ni líneas. Las que marques dejan de sumar y podés volver a incluirlas.</p>
            {plan.budgetLines.filter((line) => line.id !== replacing?.id).map((line) => (
              <label key={line.id}>
                <input
                  type="checkbox"
                  checked={coveredLines.includes(line.id)}
                  onChange={(input) => setCoveredLines((current) => input.target.checked ? [...current, line.id] : current.filter((id) => id !== line.id))}
                />{' '}
                {line.description || categoryLabels[line.category]}
              </label>
            ))}
            {plan.shoppingItems.map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  checked={coveredShopping.includes(item.id)}
                  onChange={(input) => setCoveredShopping((current) => input.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
                />{' '}
                Compra: {item.name}
              </label>
            ))}
          </fieldset>
          {applyError ? <p className="field-error">{applyError}</p> : null}
          <div className="inline-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                const result = applyQuoteSelection(plan, applying.id, applyCategory, coveredLines, coveredShopping);
                if (!result.ok) {
                  setApplyError(result.error);
                  return;
                }
                updatePlan(() => result.plan);
                setApplyId(null);
                track('budget_updated', { tool: 'presupuesto' });
              }}
            >
              Confirmar
            </button>
            <button type="button" className="button-quiet" onClick={() => setApplyId(null)}>Cancelar</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuantityEditor({ line, onCommit }: { line: BudgetLine; onCommit: (quantity: number) => void }) {
  const [text, setText] = useState(String(line.quantity));
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="field">
      <label htmlFor={`qty-${line.id}`}>Cantidad</label>
      <input
        id={`qty-${line.id}`}
        inputMode="decimal"
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `qty-error-${line.id}` : undefined}
        onChange={(input) => setText(input.target.value)}
        onBlur={() => {
          const parsed = Number(text.replace(',', '.'));
          if (!Number.isFinite(parsed) || parsed < 0) {
            setError('Ingresá una cantidad válida.');
            return;
          }
          setError(null);
          onCommit(parsed);
        }}
      />
      {error ? <p id={`qty-error-${line.id}`} className="field-error">{error}</p> : null}
    </div>
  );
}

function blankQuote(groupId: string, serviceName: string): Quote {
  return {
    id: createId('quote'),
    groupId,
    serviceName,
    optionName: '',
    fixedCentavos: null,
    perPersonCentavos: null,
    appliesTo: null,
    transportCentavos: null,
    extrasCentavos: null,
    durationHours: null,
    includedItems: '',
    exclusions: '',
    covers: [],
  };
}
