import { describe, expect, it } from 'vitest';
import { blankBudgetLine } from '../src/lib/planner/budget';
import { applyShoppingSync, previewShoppingSync, upsertBudgetFromShopping } from '../src/lib/planner/shopping';
import type { ShoppingItem } from '../src/lib/planner/types';

const generated = [
  { sourceId: 'calc:sandwich', category: 'comida' as const, name: 'Sándwiches', quantity: 25, unit: 'unidad' },
];

function ids() {
  let n = 0;
  return () => `item-${++n}`;
}

describe('lista de compras', () => {
  it('no duplica ítems ni líneas de presupuesto al sincronizar dos veces', () => {
    const create = ids();
    let items = applyShoppingSync([], generated, create);
    items = applyShoppingSync(items, generated, create);
    expect(items).toHaveLength(1);
    expect(previewShoppingSync(items, generated)).toHaveLength(0);

    let lines = [blankBudgetLine('keep', 'otros')];
    const first = upsertBudgetFromShopping(lines, items[0], create);
    items = [{ ...items[0], linkedBudgetLineId: first.lineId }];
    const second = upsertBudgetFromShopping(first.lines, items[0], create);
    expect(second.lines.filter((line) => line.shoppingSourceId === 'calc:sandwich')).toHaveLength(1);
    expect(second.lineId).toBe(first.lineId);
    expect(second.lines.some((line) => line.id === 'keep')).toBe(true);
  });

  it('marca revisión y desmarca el ítem si la cantidad sube después de comprarlo', () => {
    const create = ids();
    let items = applyShoppingSync([], generated, create);
    items = [{ ...items[0], bought: true, purchasedQuantity: 25 }];
    items = applyShoppingSync(items, [{ ...generated[0], quantity: 30 }], create);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(30);
    expect(items[0].purchasedQuantity).toBe(25);
    expect(items[0].bought).toBe(false);
    expect(items[0].reviewFlag).toBe('quantity-changed');
  });

  it('no borra un ítem editado cuando sale del menú', () => {
    const create = ids();
    let items: ShoppingItem[] = applyShoppingSync([], generated, create);
    items = [{ ...items[0], notes: 'sin semillas', userEdited: true }];
    items = applyShoppingSync(items, [], create);
    expect(items).toHaveLength(1);
    expect(items[0].removedFromMenu).toBe(true);
    expect(items[0].reviewFlag).toBe('removed-from-menu');
    expect(items[0].notes).toBe('sin semillas');
  });

  it('sí quita un ítem generado que nadie editó', () => {
    const create = ids();
    const items = applyShoppingSync(applyShoppingSync([], generated, create), [], create);
    expect(items).toHaveLength(0);
  });
});
