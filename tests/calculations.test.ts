import { describe, expect, it } from 'vitest';
import { defaultAssumptions } from '../src/config/calculator';
import {
  applyPurchaseOverrides,
  calculateFood,
  lineByKey,
  workedExampleInput,
} from '../src/lib/planner/calculations';

describe('calculadora de comida y bebida', () => {
  it('reproduce el ejemplo de 20 chicos y 10 adultos', () => {
    const result = calculateFood(workedExampleInput());
    expect(result.equivalentServings).toBe(22);
    expect(result.shareError).toBeNull();
    const sandwiches = lineByKey(result, 'sandwich');
    const cake = lineByKey(result, 'cake');
    const water = lineByKey(result, 'water');
    const other = lineByKey(result, 'otherDrink');
    expect(sandwiches?.consumption).toBe(24.2);
    expect(sandwiches?.purchase).toBe(25);
    expect(cake?.consumption).toBe(3.52);
    expect(cake?.purchase).toBe(3.75);
    expect(result.beverageConsumptionLiters).toBe(16.5);
    expect(water?.consumption).toBe(8.25);
    expect(other?.consumption).toBe(8.25);
    expect(water?.purchase).toBe(5);
    expect(other?.purchase).toBe(5);
    expect(result.beveragePurchaseLiters).toBe(20);
    expect(lineByKey(result, 'pizza')).toBeUndefined();
    expect(lineByKey(result, 'snack')).toBeUndefined();
  });

  it('reparte una sola demanda salada en un menú 50/50', () => {
    const result = calculateFood({
      ...workedExampleInput(),
      contingencyPercent: 0,
      shares: { pizza: 50, sandwich: 50, hotdog: 0 },
    });
    const pizza = lineByKey(result, 'pizza');
    const sandwiches = lineByKey(result, 'sandwich');
    expect(pizza?.consumption).toBe(16.5);
    expect(sandwiches?.consumption).toBe(11);
    expect(pizza?.consumption).toBeLessThan(33);
    expect(sandwiches?.consumption).toBeLessThan(22);
  });

  it('con cero asistentes no produce cantidades ni valores imposibles', () => {
    const result = calculateFood({ ...workedExampleInput(), children: 0, adults: 0 });
    expect(result.zeroAttendees).toBe(true);
    expect(result.equivalentServings).toBe(0);
    expect(result.lines).toHaveLength(0);
    expect(result.beverageConsumptionLiters).toBe(0);
    expect(result.beveragePurchaseLiters).toBe(0);
    expect(JSON.stringify(result)).not.toContain('NaN');
    expect(JSON.stringify(result)).not.toContain('Infinity');
  });

  it('la duración cambia las bebidas y no la comida salada ni la torta', () => {
    const shortParty = calculateFood(workedExampleInput());
    const longParty = calculateFood({ ...workedExampleInput(), hours: 8 });
    expect(lineByKey(longParty, 'sandwich')?.purchase).toBe(lineByKey(shortParty, 'sandwich')?.purchase);
    expect(lineByKey(longParty, 'cake')?.purchase).toBe(lineByKey(shortParty, 'cake')?.purchase);
    expect(longParty.beverageConsumptionLiters).toBe(44);
    expect(shortParty.beverageConsumptionLiters).toBe(16.5);
  });

  it('conserva un ajuste manual y lo marca si el cálculo cambia', () => {
    const first = calculateFood(workedExampleInput());
    const sandwich = lineByKey(first, 'sandwich');
    expect(sandwich?.purchase).toBe(25);
    const displayed = applyPurchaseOverrides(first, {
      sandwich: { value: 30, calculatedWhenSet: 25 },
    });
    expect(displayed.find((line) => line.key === 'sandwich')).toMatchObject({
      purchase: 30,
      adjusted: true,
      needsReview: false,
    });
    const changed = calculateFood({ ...workedExampleInput(), children: 30 });
    const reviewed = applyPurchaseOverrides(changed, {
      sandwich: { value: 30, calculatedWhenSet: 25 },
    });
    const line = reviewed.find((item) => item.key === 'sandwich');
    expect(line?.adjusted).toBe(true);
    expect(line?.needsReview).toBe(true);
    expect(line?.purchase).toBe(30);
    expect(line?.recalculatedPurchase).not.toBe(25);
  });

  it('no calcula la comida salada si los porcentajes no suman 100', () => {
    const result = calculateFood({
      ...workedExampleInput(),
      shares: { pizza: 40, sandwich: 40, hotdog: 0 },
      assumptions: defaultAssumptions(),
    });
    expect(result.shareError).toBeTruthy();
    expect(lineByKey(result, 'sandwich')).toBeUndefined();
    expect(lineByKey(result, 'cake')?.purchase).toBe(3.75);
  });
});
