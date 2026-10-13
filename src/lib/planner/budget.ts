import type { BudgetLine, EventDetails, Quote, QuoteAppliesTo } from './types';

export type QuoteMath = {
  totalCentavos: number | null;
  missing: string[];
  applicableCount: number | null;
};

export function applicablePeople(
  appliesTo: QuoteAppliesTo | null,
  children: number,
  adults: number,
): number | null {
  if (appliesTo === 'children') return children;
  if (appliesTo === 'adults') return adults;
  if (appliesTo === 'both') return children + adults;
  return null;
}

export function quoteTotal(
  quote: Pick<Quote, 'fixedCentavos' | 'perPersonCentavos' | 'transportCentavos' | 'extrasCentavos' | 'appliesTo'>,
  applicableCount: number | null,
): QuoteMath {
  const missing: string[] = [];
  if (quote.fixedCentavos == null) missing.push('tarifa fija');
  if (quote.perPersonCentavos == null) missing.push('importe por persona');
  if (quote.transportCentavos == null) missing.push('traslado');
  if (quote.extrasCentavos == null) missing.push('extras');
  if (quote.perPersonCentavos != null && quote.perPersonCentavos > 0 && applicableCount == null) {
    missing.push('a quiénes aplica el importe por persona');
  }
  if (missing.length > 0) {
    return { totalCentavos: null, missing, applicableCount };
  }
  const count = quote.perPersonCentavos === 0 ? (applicableCount ?? 0) : (applicableCount ?? 0);
  const total =
    (quote.fixedCentavos ?? 0) +
    (quote.perPersonCentavos ?? 0) * count +
    (quote.transportCentavos ?? 0) +
    (quote.extrasCentavos ?? 0);
  return { totalCentavos: total, missing: [], applicableCount: count };
}

export function cheapestQuoteIds(totals: Array<{ id: string; totalCentavos: number | null }>): string[] {
  const complete = totals.filter((item) => item.totalCentavos != null) as Array<{
    id: string;
    totalCentavos: number;
  }>;
  if (complete.length < 2) return [];
  const min = Math.min(...complete.map((item) => item.totalCentavos));
  return complete.filter((item) => item.totalCentavos === min).map((item) => item.id);
}

export function lineEstimateCentavos(line: BudgetLine): number | null {
  if (line.excluded || line.unitPriceCentavos == null) return null;
  return line.quantity * line.unitPriceCentavos;
}

export function lineCommittedCentavos(line: BudgetLine): number | null {
  if (line.excluded) return null;
  if (line.contractedCentavos != null) return line.contractedCentavos;
  return lineEstimateCentavos(line);
}

export function linePendingCentavos(line: BudgetLine): number | null {
  if (line.excluded || line.contractedCentavos == null) return null;
  return line.contractedCentavos - line.paidCentavos;
}

export function paymentError(paidCentavos: number, contractedCentavos: number | null): string | null {
  if (paidCentavos < 0) return 'El pago no puede ser negativo.';
  if (paidCentavos === 0) return null;
  if (contractedCentavos == null) {
    return 'Primero cargá el importe contratado. La seña se anota como pago, no como otro gasto.';
  }
  if (paidCentavos > contractedCentavos) {
    return 'El pago supera lo contratado. Corregilo: la seña ya está incluida en ese importe.';
  }
  return null;
}

export type BudgetTotals = {
  estimatedCentavos: number | null;
  committedCentavos: number | null;
  paidCentavos: number;
  pendingCentavos: number | null;
  hasContractedLine: boolean;
  partialEstimates: boolean;
  partialCommitted: boolean;
  perAttendeeCentavos: number | null;
  targetDifferenceCentavos: number | null;
};

export function budgetTotals(lines: BudgetLine[], event: Pick<EventDetails, 'childrenCount' | 'adultsCount' | 'budgetTargetCentavos'>): BudgetTotals {
  const active = lines.filter((line) => !line.excluded);
  let estimated = 0;
  let estimatedAny = false;
  let partialEstimates = false;
  let committed = 0;
  let committedAny = false;
  let partialCommitted = false;
  let paid = 0;
  let pending = 0;
  let hasContractedLine = false;

  for (const line of active) {
    paid += line.paidCentavos;
    const estimate = lineEstimateCentavos(line);
    if (estimate == null) partialEstimates = true;
    else {
      estimated += estimate;
      estimatedAny = true;
    }
    if (line.contractedCentavos != null) {
      hasContractedLine = true;
      pending += line.contractedCentavos - line.paidCentavos;
    }
    const commit = lineCommittedCentavos(line);
    if (commit == null) partialCommitted = true;
    else {
      committed += commit;
      committedAny = true;
    }
  }

  const attendees = event.childrenCount + event.adultsCount;
  const estimatedCentavos = estimatedAny ? estimated : null;
  const committedCentavos = committedAny ? committed : null;
  return {
    estimatedCentavos,
    committedCentavos,
    paidCentavos: paid,
    pendingCentavos: hasContractedLine ? pending : null,
    hasContractedLine,
    partialEstimates,
    partialCommitted,
    perAttendeeCentavos:
      attendees > 0 && estimatedCentavos != null ? Math.round(estimatedCentavos / attendees) : null,
    targetDifferenceCentavos:
      event.budgetTargetCentavos != null && committedCentavos != null
        ? event.budgetTargetCentavos - committedCentavos
        : null,
  };
}

export function blankBudgetLine(id: string, category: BudgetLine['category'] = 'otros'): BudgetLine {
  return {
    id,
    category,
    description: '',
    quantity: 1,
    unit: 'unidad',
    unitPriceCentavos: null,
    contractedCentavos: null,
    paidCentavos: 0,
    notes: '',
    shoppingSourceId: null,
    shoppingItemId: null,
    quoteGroupId: null,
    sourceQuoteId: null,
    excluded: false,
    exclusionNote: '',
  };
}
