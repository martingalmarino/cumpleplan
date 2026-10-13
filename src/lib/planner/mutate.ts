import { defaultAssumptions } from '../../config/calculator';
import { applicablePeople, blankBudgetLine, paymentError, quoteTotal } from './budget';
import { workedExampleInput } from './calculations';
import { createId } from './ids';
import type { BudgetCategory, Plan, Quote } from './types';

export function loadFoodExample(plan: Plan): Plan {
  const example = workedExampleInput();
  return {
    ...plan,
    event: {
      ...plan.event,
      childrenCount: example.children,
      adultsCount: example.adults,
      durationHours: example.hours,
    },
    calculator: {
      ...plan.calculator,
      servingStyle: example.servingStyle,
      contingencyPercent: example.contingencyPercent,
      shares: { ...example.shares },
      assumptions: defaultAssumptions(),
      overrides: {},
    },
  };
}

export function applyQuoteSelection(
  plan: Plan,
  quoteId: string,
  category: BudgetCategory,
  coveredBudgetLineIds: string[],
  coveredShoppingItemIds: string[],
): { ok: true; plan: Plan } | { ok: false; error: string } {
  const quote = plan.quotes.find((item) => item.id === quoteId);
  if (!quote) return { ok: false, error: 'No encontramos esa alternativa.' };
  const count = applicablePeople(quote.appliesTo, plan.event.childrenCount, plan.event.adultsCount);
  const math = quoteTotal(quote, count);
  if (math.totalCentavos == null) {
    return { ok: false, error: `Para usarla faltan: ${math.missing.join(', ')}.` };
  }

  const existing = plan.budgetLines.find((line) => line.quoteGroupId === quote.groupId);
  if (existing && existing.paidCentavos > math.totalCentavos) {
    return {
      ok: false,
      error: 'El pago ya cargado en esa línea supera este importe. Corregilo antes de reemplazarla.',
    };
  }

  const lineId = existing?.id ?? createId('budget');
  const nextLine = {
    ...(existing ?? blankBudgetLine(lineId, category)),
    id: lineId,
    category,
    description: `${quote.serviceName} — ${quote.optionName}`.slice(0, 160),
    quantity: 1,
    unit: 'servicio',
    unitPriceCentavos: math.totalCentavos,
    contractedCentavos: math.totalCentavos,
    paidCentavos: existing?.paidCentavos ?? 0,
    quoteGroupId: quote.groupId,
    sourceQuoteId: quote.id,
    excluded: false,
    exclusionNote: '',
  };
  const payError = paymentError(nextLine.paidCentavos, nextLine.contractedCentavos);
  if (payError) return { ok: false, error: payError };

  let lines = existing
    ? plan.budgetLines.map((line) => (line.id === existing.id ? nextLine : line))
    : [...plan.budgetLines, nextLine];

  const coveredLines = new Set(coveredBudgetLineIds.filter((id) => id !== lineId));
  lines = lines.map((line) =>
    coveredLines.has(line.id)
      ? { ...line, excluded: true, exclusionNote: `Cubierto por ${quote.optionName}`.slice(0, 200) }
      : line,
  );

  let shoppingItems = plan.shoppingItems.map((item) => ({ ...item }));
  for (const shoppingId of coveredShoppingItemIds) {
    const item = shoppingItems.find((entry) => entry.id === shoppingId);
    if (!item) continue;
    const linked = lines.find(
      (line) =>
        line.id !== lineId &&
        (line.id === item.linkedBudgetLineId || (item.sourceId != null && line.shoppingSourceId === item.sourceId)),
    );
    if (linked) {
      lines = lines.map((line) =>
        line.id === linked.id
          ? { ...line, excluded: true, exclusionNote: `Cubierto por ${quote.optionName}`.slice(0, 200) }
          : line,
      );
      continue;
    }
    const created = blankBudgetLine(createId('budget'), item.category);
    created.description = item.name;
    created.quantity = item.quantity;
    created.unit = item.unit;
    created.shoppingSourceId = item.sourceId;
    created.shoppingItemId = item.id;
    created.excluded = true;
    created.exclusionNote = `Cubierto por ${quote.optionName}`.slice(0, 200);
    lines = [...lines, created];
    shoppingItems = shoppingItems.map((entry) =>
      entry.id === item.id ? { ...entry, linkedBudgetLineId: created.id, userEdited: true } : entry,
    );
  }

  return { ok: true, plan: { ...plan, budgetLines: lines, shoppingItems } };
}

export function restoreBudgetLine(plan: Plan, lineId: string): Plan {
  return {
    ...plan,
    budgetLines: plan.budgetLines.map((line) =>
      line.id === lineId ? { ...line, excluded: false, exclusionNote: '' } : line,
    ),
  };
}

export function quoteLabel(quote: Quote): string {
  return `${quote.serviceName} — ${quote.optionName}`;
}
