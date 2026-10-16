import { useState } from 'react';
import { plannerLimits } from '../../config/calculator';
import { track } from '../../lib/analytics';
import { applyPurchaseOverrides, calculateFood } from '../../lib/planner/calculations';
import { foodLabels, seasonLabels, servingLabels } from '../../lib/planner/labels';
import { formatQty } from '../../lib/planner/money';
import { loadFoodExample } from '../../lib/planner/mutate';
import { updatePlan } from '../../lib/planner/store';
import type { FoodKey, Plan, Season, ServingStyle } from '../../lib/planner/types';
import { DirectoryCTA } from './DirectoryCTA';
import { DecimalField, IntegerField } from './fields';

const foods: FoodKey[] = ['pizza', 'sandwichMiga', 'sandwichGrande', 'hotdog'];

export function FoodCalculator({ plan }: { plan: Plan }) {
  const [confirmExample, setConfirmExample] = useState(false);
  const calculator = plan.calculator;
  const computation = calculateFood({
    children: plan.event.childrenCount,
    adults: plan.event.adultsCount,
    hours: plan.event.durationHours,
    servingStyle: calculator.servingStyle,
    season: calculator.season,
    contingencyPercent: calculator.contingencyPercent,
    shares: calculator.shares,
    assumptions: calculator.assumptions,
  });
  const lines = applyPurchaseOverrides(computation, calculator.overrides);
  const shareTotal = foods.reduce((sum, food) => sum + calculator.shares[food], 0);

  function patchShares(food: FoodKey, share: number) {
    updatePlan((current) => ({
      ...current,
      calculator: { ...current.calculator, shares: { ...current.calculator.shares, [food]: share } },
    }));
    if (plan.event.childrenCount + plan.event.adultsCount > 0) track('calculator_completed', { tool: 'comida' });
  }

  return (
    <div className="stack">
      <h2>Comida y bebida</h2>
      <p className="hint">Los cambios se guardan en tu plan de este navegador.</p>
      <div className="inline-actions">
        <button type="button" className="button-quiet" onClick={() => setConfirmExample(true)}>
          Cargar el ejemplo de 20 chicos y 10 adultos
        </button>
      </div>
      {confirmExample ? (
        <div className="confirm-box" role="alertdialog" aria-labelledby="example-title">
          <h3 id="example-title">Este ejemplo reemplaza asistentes, duración, menú y margen</h3>
          <p>No borra el presupuesto, la checklist ni las notas. Los ajustes manuales de cantidades vuelven al cálculo.</p>
          <div className="inline-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                updatePlan(loadFoodExample);
                setConfirmExample(false);
                track('calculator_completed', { tool: 'comida' });
              }}
            >
              Cargar ejemplo
            </button>
            <button type="button" className="button-quiet" onClick={() => setConfirmExample(false)}>Cancelar</button>
          </div>
        </div>
      ) : null}

      <div className="field-grid">
        <div className="field">
          <label htmlFor="serving-style">Estilo</label>
          <select
            id="serving-style"
            value={calculator.servingStyle}
            onChange={(input) =>
              updatePlan((current) => ({
                ...current,
                calculator: { ...current.calculator, servingStyle: input.target.value as ServingStyle },
              }))
            }
          >
            {(Object.keys(servingLabels) as ServingStyle[]).map((style) => (
              <option key={style} value={style}>{servingLabels[style]}</option>
            ))}
          </select>
          <p className="hint">Pizza, sándwiches o panchos son alternativas del mismo pedido, no tres comidas juntas.</p>
        </div>
        <div className="field">
          <label htmlFor="season">Temporada</label>
          <select
            id="season"
            value={calculator.season}
            onChange={(input) =>
              updatePlan((current) => ({
                ...current,
                calculator: { ...current.calculator, season: input.target.value as Season },
              }))
            }
          >
            {(Object.keys(seasonLabels) as Season[]).map((season) => (
              <option key={season} value={season}>{seasonLabels[season]}</option>
            ))}
          </select>
          <p className="hint">En verano se aumentan las bebidas automáticamente.</p>
        </div>
        <IntegerField
          label="Margen extra"
          hint="Del 0 al 30 %. Se aplica una sola vez, antes de redondear la compra."
          value={calculator.contingencyPercent}
          min={0}
          max={plannerLimits.maxContingency}
          onCommit={(contingencyPercent) =>
            updatePlan((current) => ({ ...current, calculator: { ...current.calculator, contingencyPercent } }))
          }
        />
      </div>

      <fieldset>
        <legend>Reparto del menú salado</legend>
        <div className="field-grid">
          {foods.map((food) => (
            <IntegerField
              key={food}
              label={`${foodLabels[food]} (%)`}
              value={calculator.shares[food]}
              min={0}
              max={100}
              onCommit={(share) => patchShares(food, share)}
            />
          ))}
        </div>
        <p className={shareTotal === 100 ? 'hint' : 'field-error'}>
          {shareTotal === 100
            ? 'Los porcentajes suman 100 %.'
            : `Ahora suman ${shareTotal} %. Tienen que sumar 100 % para calcular la comida salada.`}
        </p>
      </fieldset>

      <details>
        <summary>Editar supuestos de cálculo</summary>
        <div className="field-grid">
          <DecimalField
            label="Factor de chicos"
            hint="Por defecto 0,6: un chico cuenta como 0,6 porción de adulto."
            value={calculator.assumptions.childFactor}
            min={0.2}
            max={1.5}
            onCommit={(childFactor) =>
              updatePlan((current) => ({
                ...current,
                calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, childFactor } },
              }))
            }
          />
          <IntegerField
            label="Porciones por pizza"
            value={calculator.assumptions.pizzaSlicesPerPizza}
            min={4}
            max={16}
            onCommit={(pizzaSlicesPerPizza) =>
              updatePlan((current) => ({
                ...current,
                calculator: {
                  ...current.calculator,
                  assumptions: { ...current.calculator.assumptions, pizzaSlicesPerPizza },
                },
              }))
            }
          />
          <DecimalField label="Kg de torta por chico" value={calculator.assumptions.cakeKgPerChild} min={0} max={1} onCommit={(cakeKgPerChild) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, cakeKgPerChild } } }))} />
          <DecimalField label="Kg de torta por adulto" value={calculator.assumptions.cakeKgPerAdult} min={0} max={1} onCommit={(cakeKgPerAdult) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, cakeKgPerAdult } } }))} />
          <DecimalField label="Litros por chico por hora" value={calculator.assumptions.drinkLitersPerChildPerHour} min={0} max={1} onCommit={(drinkLitersPerChildPerHour) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, drinkLitersPerChildPerHour } } }))} />
          <DecimalField label="Litros por adulto por hora" value={calculator.assumptions.drinkLitersPerAdultPerHour} min={0} max={1} onCommit={(drinkLitersPerAdultPerHour) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, drinkLitersPerAdultPerHour } } }))} />
          <IntegerField label="% Agua" value={calculator.assumptions.waterPercent} min={0} max={100} onCommit={(waterPercent) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, waterPercent } } }))} />
          <IntegerField label="% Gaseosa" value={calculator.assumptions.sodaPercent} min={0} max={100} onCommit={(sodaPercent) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, sodaPercent } } }))} />
          <IntegerField label="% Jugo" value={calculator.assumptions.juicePercent} min={0} max={100} onCommit={(juicePercent) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, juicePercent } } }))} />
          <DecimalField label="Litros por envase" value={calculator.assumptions.packageLiters} min={0.25} max={10} onCommit={(packageLiters) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, packageLiters } } }))} />
          <DecimalField label="Snacks salados por chico" hint="Paquetes individuales (papas, chizitos)" value={calculator.assumptions.snackSaltyUnitsPerChild} min={0} max={5} onCommit={(snackSaltyUnitsPerChild) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, snackSaltyUnitsPerChild } } }))} />
          <DecimalField label="Golosinas por chico" hint="Bolsitas sorpresa" value={calculator.assumptions.snackSweetUnitsPerChild} min={0} max={5} onCommit={(snackSweetUnitsPerChild) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, snackSweetUnitsPerChild } } }))} />
          <DecimalField label="Empanadas por adulto" hint="Comida para adultos" value={calculator.assumptions.empanadaUnitsPerAdult} min={0} max={10} onCommit={(empanadaUnitsPerAdult) => updatePlan((current) => ({ ...current, calculator: { ...current.calculator, assumptions: { ...current.calculator.assumptions, empanadaUnitsPerAdult } } }))} />
        </div>
        <label>
          <input
            type="checkbox"
            checked={calculator.assumptions.coffeeEnabled}
            onChange={(input) =>
              updatePlan((current) => ({
                ...current,
                calculator: {
                  ...current.calculator,
                  assumptions: { ...current.calculator.assumptions, coffeeEnabled: input.target.checked },
                },
              }))
            }
          />{' '}
          Incluir café/mate para adultos
        </label>
        {calculator.assumptions.coffeeEnabled ? (
          <DecimalField
            label="Tazas por adulto"
            hint="Café o mate"
            value={calculator.assumptions.coffeeCupsPerAdult}
            min={0}
            max={5}
            onCommit={(coffeeCupsPerAdult) =>
              updatePlan((current) => ({
                ...current,
                calculator: {
                  ...current.calculator,
                  assumptions: { ...current.calculator.assumptions, coffeeCupsPerAdult },
                },
              }))
            }
          />
        ) : null}
      </details>

      {computation.message ? <div className="banner" role="status"><p>{computation.message}</p></div> : null}
      {computation.shareError ? <div className="banner warning" role="alert"><p>{computation.shareError}</p></div> : null}

      <div className="results" aria-live="polite">
        <h3>Estimación orientativa</h3>
        <p className="hint">Cantidades orientativas que podés ajustar.</p>
        <p>Porciones equivalentes: <strong className="money">{formatQty(computation.equivalentServings)}</strong></p>
        {lines.map((line) => (
          <article className="result-line" key={line.key}>
            <header>
              <h4>{line.label}</h4>
              {line.adjusted ? <span className="tag">Ajustado por vos</span> : null}
              {line.needsReview ? <span className="tag review">Revisar</span> : null}
            </header>
            <p>Consumo: {formatQty(line.consumption)} {line.consumptionUnit}</p>
            <p>Compra: <strong>{formatQty(line.purchase)} {line.purchaseUnit}</strong></p>
            <p className="hint">{line.detail}</p>
            {line.needsReview ? (
              <p className="hint">El cálculo nuevo da {formatQty(line.recalculatedPurchase)} {line.purchaseUnit}. Seguimos usando tu ajuste hasta que lo reinicies.</p>
            ) : null}
            <DecimalField
              label={`Ajustar compra de ${line.label}`}
              value={line.purchase}
              min={0}
              max={10000}
              onCommit={(value) =>
                updatePlan((current) => {
                  const overrides = { ...current.calculator.overrides };
                  if (value === line.recalculatedPurchase) delete overrides[line.key];
                  else overrides[line.key] = { value, calculatedWhenSet: line.recalculatedPurchase };
                  return { ...current, calculator: { ...current.calculator, overrides } };
                })
              }
            />
            {line.adjusted ? (
              <button
                type="button"
                className="button-quiet"
                onClick={() =>
                  updatePlan((current) => {
                    const overrides = { ...current.calculator.overrides };
                    delete overrides[line.key];
                    return { ...current, calculator: { ...current.calculator, overrides } };
                  })
                }
              >
                Volver al cálculo
              </button>
            ) : null}
          </article>
        ))}
        {!computation.zeroAttendees ? (
          <p className="hint">
            Bebidas: {formatQty(computation.beverageConsumptionLiters)} L de consumo y {formatQty(computation.beveragePurchaseLiters)} L si comprás los envases enteros. La duración no multiplica la comida salada ni la torta.
          </p>
        ) : null}
        <ul>
          {computation.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
        {!computation.zeroAttendees ? (
          <div className="inline-actions">
            <DirectoryCTA 
              rubro="tortas-catering" 
              province={plan.event.province}
              dataAction="food-calculator"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
