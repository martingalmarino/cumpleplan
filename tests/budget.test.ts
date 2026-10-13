import { describe, expect, it } from 'vitest';
import { blankBudgetLine, budgetTotals, paymentError, quoteTotal } from '../src/lib/planner/budget';
import type { EventDetails } from '../src/lib/planner/types';

const event = (overrides: Partial<EventDetails> = {}): EventDetails => ({
  label: 'Mi cumple',
  date: null,
  age: null,
  setting: 'casa',
  durationHours: 3,
  childrenCount: 20,
  adultsCount: 10,
  budgetTargetCentavos: null,
  ...overrides,
});

describe('presupuestos y pagos', () => {
  it('suma tarifa fija, por persona y traslado', () => {
    const result = quoteTotal(
      {
        fixedCentavos: 10_000_000,
        perPersonCentavos: 200_000,
        transportCentavos: 1_000_000,
        extrasCentavos: 0,
        appliesTo: 'both',
      },
      30,
    );
    expect(result.missing).toEqual([]);
    expect(result.totalCentavos).toBe(17_000_000);
  });

  it('la seña queda dentro de lo contratado y no se suma de nuevo', () => {
    const line = {
      ...blankBudgetLine('line-salon', 'lugar'),
      description: 'Salón, ejemplo hipotético',
      quantity: 1,
      unit: 'servicio',
      unitPriceCentavos: 17_000_000,
      contractedCentavos: 17_000_000,
      paidCentavos: 5_000_000,
    };
    const totals = budgetTotals([line], event());
    expect(totals.estimatedCentavos).toBe(17_000_000);
    expect(totals.committedCentavos).toBe(17_000_000);
    expect(totals.paidCentavos).toBe(5_000_000);
    expect(totals.pendingCentavos).toBe(12_000_000);
    expect(paymentError(17_000_001, 17_000_000)).toBeTruthy();
    expect(paymentError(5_000_000, null)).toMatch(/contratado/);
  });

  it('no divide por persona si no hay asistentes', () => {
    const line = {
      ...blankBudgetLine('line-torta', 'torta'),
      unitPriceCentavos: 4_000_000,
      quantity: 1,
    };
    const totals = budgetTotals([line], event({ childrenCount: 0, adultsCount: 0 }));
    expect(totals.perAttendeeCentavos).toBeNull();
    expect(totals.estimatedCentavos).toBe(4_000_000);
  });

  it('no muestra un saldo negativo cuando el pago entra en lo contratado', () => {
    expect(paymentError(12_000_000, 17_000_000)).toBeNull();
    const line = {
      ...blankBudgetLine('line-ok', 'animacion'),
      contractedCentavos: 17_000_000,
      paidCentavos: 12_000_000,
      unitPriceCentavos: null,
    };
    expect(budgetTotals([line], event()).pendingCentavos).toBe(5_000_000);
  });
});
