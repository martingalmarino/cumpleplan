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
    const sandwiches = lineByKey(result, 'sandwichMiga');
    const cake = lineByKey(result, 'cake');
    const water = lineByKey(result, 'water');
    const soda = lineByKey(result, 'soda');
    const juice = lineByKey(result, 'juice');
    expect(sandwiches?.consumption).toBe(121);
    expect(sandwiches?.purchase).toBe(121);
    expect(cake?.consumption).toBe(3.52);
    expect(cake?.purchase).toBe(3.75);
    expect(result.beverageConsumptionLiters).toBeCloseTo(21.45, 2);
    expect(water?.consumption).toBeCloseTo(6.435, 2);
    expect(soda?.consumption).toBeCloseTo(8.58, 2);
    expect(juice?.consumption).toBeCloseTo(6.435, 2);
    expect(water?.purchase).toBe(4);
    expect(soda?.purchase).toBe(5);
    expect(juice?.purchase).toBe(4);
    expect(result.beveragePurchaseLiters).toBe(26);
    expect(lineByKey(result, 'pizza')).toBeUndefined();
    expect(lineByKey(result, 'snackSalty')).toBeDefined();
    expect(lineByKey(result, 'snackSweet')).toBeDefined();
  });

  it('reparte una sola demanda salada en un menú 50/50', () => {
    const result = calculateFood({
      ...workedExampleInput(),
      contingencyPercent: 0,
      shares: { pizza: 50, sandwichMiga: 50, sandwichGrande: 0, hotdog: 0 },
    });
    const pizza = lineByKey(result, 'pizza');
    const sandwiches = lineByKey(result, 'sandwichMiga');
    expect(pizza?.consumption).toBe(16.5);
    expect(sandwiches?.consumption).toBe(55);
    expect(pizza?.consumption).toBeLessThan(33);
    expect(sandwiches?.consumption).toBeLessThan(130);
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
    expect(lineByKey(longParty, 'sandwichMiga')?.purchase).toBe(lineByKey(shortParty, 'sandwichMiga')?.purchase);
    expect(lineByKey(longParty, 'cake')?.purchase).toBe(lineByKey(shortParty, 'cake')?.purchase);
    expect(longParty.beverageConsumptionLiters).toBeCloseTo(57.2, 1);
    expect(shortParty.beverageConsumptionLiters).toBeCloseTo(21.45, 2);
  });

  it('conserva un ajuste manual y lo marca si el cálculo cambia', () => {
    const first = calculateFood(workedExampleInput());
    const sandwich = lineByKey(first, 'sandwichMiga');
    expect(sandwich?.purchase).toBe(121);
    const displayed = applyPurchaseOverrides(first, {
      sandwichMiga: { value: 130, calculatedWhenSet: 121 },
    });
    expect(displayed.find((line) => line.key === 'sandwichMiga')).toMatchObject({
      purchase: 130,
      adjusted: true,
      needsReview: false,
    });
    const changed = calculateFood({ ...workedExampleInput(), children: 30 });
    const reviewed = applyPurchaseOverrides(changed, {
      sandwichMiga: { value: 130, calculatedWhenSet: 121 },
    });
    const line = reviewed.find((item) => item.key === 'sandwichMiga');
    expect(line?.adjusted).toBe(true);
    expect(line?.needsReview).toBe(true);
    expect(line?.purchase).toBe(130);
    expect(line?.recalculatedPurchase).not.toBe(121);
  });

  it('no calcula la comida salada si los porcentajes no suman 100', () => {
    const result = calculateFood({
      ...workedExampleInput(),
      shares: { pizza: 40, sandwichMiga: 40, sandwichGrande: 0, hotdog: 0 },
      assumptions: defaultAssumptions(),
    });
    expect(result.shareError).toBeTruthy();
    expect(lineByKey(result, 'sandwichMiga')).toBeUndefined();
    expect(lineByKey(result, 'cake')?.purchase).toBe(3.75);
  });
});
