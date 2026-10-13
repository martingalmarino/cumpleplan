import type { BudgetCategory, BudgetLine, ShoppingItem } from './types';
import type { DisplayLine } from './calculations';
import { blankBudgetLine } from './budget';
import { formatQty } from './money';

export type GeneratedShopping = {
  sourceId: string;
  category: BudgetCategory;
  name: string;
  quantity: number;
  unit: string;
};

export type SyncChange =
  | { type: 'add'; sourceId: string; name: string; quantity: number; unit: string }
  | { type: 'update'; sourceId: string; name: string; fromQuantity: number; toQuantity: number; unit: string }
  | { type: 'review-removal'; sourceId: string; name: string }
  | { type: 'remove'; sourceId: string; name: string };

export function generatedFromLines(lines: DisplayLine[]): GeneratedShopping[] {
  return lines
    .filter((line) => line.purchase > 0)
    .map((line) => ({
      sourceId: line.sourceId,
      category: line.category,
      name: line.label,
      quantity: line.purchase,
      unit: line.purchaseUnit,
    }));
}

function hasUserWork(item: ShoppingItem): boolean {
  return (
    item.userEdited ||
    item.notes.trim().length > 0 ||
    item.bought ||
    item.purchasedQuantity > 0 ||
    item.linkedBudgetLineId != null
  );
}

export function previewShoppingSync(items: ShoppingItem[], generated: GeneratedShopping[]): SyncChange[] {
  const changes: SyncChange[] = [];
  const active = items.filter((item) => item.sourceId && !item.removedFromMenu);

  for (const next of generated) {
    const current = active.find((item) => item.sourceId === next.sourceId);
    if (!current) {
      const parked = items.find((item) => item.sourceId === next.sourceId && item.removedFromMenu);
      if (!parked) {
        changes.push({
          type: 'add',
          sourceId: next.sourceId,
          name: next.name,
          quantity: next.quantity,
          unit: next.unit,
        });
      } else if (parked.quantity !== next.quantity) {
        changes.push({
          type: 'update',
          sourceId: next.sourceId,
          name: next.name,
          fromQuantity: parked.quantity,
          toQuantity: next.quantity,
          unit: next.unit,
        });
      } else {
        changes.push({
          type: 'update',
          sourceId: next.sourceId,
          name: next.name,
          fromQuantity: parked.quantity,
          toQuantity: next.quantity,
          unit: next.unit,
        });
      }
    } else if (current.quantity !== next.quantity || current.unit !== next.unit || current.name !== next.name) {
      changes.push({
        type: 'update',
        sourceId: next.sourceId,
        name: next.name,
        fromQuantity: current.quantity,
        toQuantity: next.quantity,
        unit: next.unit,
      });
    }
  }

  for (const item of items) {
    if (!item.sourceId || item.removedFromMenu) continue;
    if (generated.some((next) => next.sourceId === item.sourceId)) continue;
    if (hasUserWork(item)) {
      changes.push({ type: 'review-removal', sourceId: item.sourceId, name: item.name });
    } else {
      changes.push({ type: 'remove', sourceId: item.sourceId, name: item.name });
    }
  }

  return changes;
}

export function applyShoppingSync(
  items: ShoppingItem[],
  generated: GeneratedShopping[],
  createId: () => string,
): ShoppingItem[] {
  const nextItems = items.map((item) => ({ ...item }));

  for (const generatedItem of generated) {
    const index = nextItems.findIndex((item) => item.sourceId === generatedItem.sourceId);
    if (index === -1) {
      nextItems.push({
        id: createId(),
        sourceId: generatedItem.sourceId,
        category: generatedItem.category,
        name: generatedItem.name,
        quantity: generatedItem.quantity,
        unit: generatedItem.unit,
        purchasedQuantity: 0,
        bought: false,
        notes: '',
        linkedBudgetLineId: null,
        reviewFlag: null,
        removedFromMenu: false,
        userEdited: false,
      });
      continue;
    }

    const current = nextItems[index];
    const quantityIncreased = generatedItem.quantity > current.quantity;
    const wasComplete = current.bought || (current.quantity > 0 && current.purchasedQuantity >= current.quantity);
    const purchasedQuantity = current.purchasedQuantity;
    const bought = purchasedQuantity >= generatedItem.quantity && generatedItem.quantity > 0;
    let reviewFlag = current.reviewFlag;
    if (current.removedFromMenu || reviewFlag === 'removed-from-menu') reviewFlag = null;
    if (quantityIncreased && wasComplete && !bought) reviewFlag = 'quantity-changed';
    if (bought && reviewFlag === 'quantity-changed') reviewFlag = null;
    nextItems[index] = {
      ...current,
      category: generatedItem.category,
      name: generatedItem.name,
      quantity: generatedItem.quantity,
      unit: generatedItem.unit,
      purchasedQuantity,
      bought,
      removedFromMenu: false,
      reviewFlag,
    };
  }

  return nextItems.filter((item) => {
    if (!item.sourceId || item.removedFromMenu) return true;
    if (generated.some((generatedItem) => generatedItem.sourceId === item.sourceId)) return true;
    if (hasUserWork(item)) {
      item.removedFromMenu = true;
      item.reviewFlag = 'removed-from-menu';
      item.bought = false;
      return true;
    }
    return false;
  });
}

export function upsertBudgetFromShopping(
  lines: BudgetLine[],
  item: ShoppingItem,
  createId: () => string,
): { lines: BudgetLine[]; lineId: string } {
  const existing = lines.find(
    (line) =>
      (item.sourceId != null && line.shoppingSourceId === item.sourceId) ||
      (item.linkedBudgetLineId != null && line.id === item.linkedBudgetLineId) ||
      line.shoppingItemId === item.id,
  );
  if (existing) {
    return {
      lineId: existing.id,
      lines: lines.map((line) =>
        line.id === existing.id
          ? {
              ...line,
              category: item.category,
              description: item.name,
              quantity: item.quantity,
              unit: item.unit,
              shoppingSourceId: item.sourceId,
              shoppingItemId: item.id,
            }
          : line,
      ),
    };
  }
  const created = {
    ...blankBudgetLine(createId(), item.category),
    description: item.name,
    quantity: item.quantity,
    unit: item.unit,
    shoppingSourceId: item.sourceId,
    shoppingItemId: item.id,
  };
  return { lineId: created.id, lines: [...lines, created] };
}

export function shoppingPlainText(items: ShoppingItem[]): string {
  const visible = items.filter((item) => !item.removedFromMenu);
  if (visible.length === 0) return 'Lista de compras vacía.';
  const groups = new Map<string, ShoppingItem[]>();
  for (const item of visible) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  const lines: string[] = ['Lista de compras'];
  for (const [category, group] of groups) {
    lines.push('', category);
    for (const item of group) {
      const mark = item.bought ? '[x]' : '[ ]';
      lines.push(`${mark} ${item.name}: ${formatQty(item.quantity)} ${item.unit}`);
      if (item.notes.trim()) lines.push(`    nota: ${item.notes.trim()}`);
    }
  }
  return lines.join('\n');
}
