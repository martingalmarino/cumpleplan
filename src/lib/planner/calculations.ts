import { defaultAssumptions } from '../../config/calculator';
import { formatQty } from './money';
import type { Assumptions, CalculatorState, FoodKey, FoodLine, MenuShares, ServingStyle } from './types';

export type CalcInput = {
  children: number;
  adults: number;
  hours: number;
  servingStyle: ServingStyle;
  contingencyPercent: number;
  shares: MenuShares;
  assumptions: Assumptions;
};

export type FoodComputation = {
  valid: boolean;
  message: string | null;
  shareError: string | null;
  zeroAttendees: boolean;
  equivalentServings: number;
  lines: FoodLine[];
  beverageConsumptionLiters: number;
  beveragePurchaseLiters: number;
  notes: string[];
};

function round(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function ceilCount(value: number): number {
  const rounded = round(value, 6);
  if (rounded <= 0) return 0;
  return Math.ceil(rounded);
}

function ceilDiv(value: number, size: number): number {
  if (value <= 0 || size <= 0) return 0;
  return Math.ceil(round(value / size, 6));
}

function roundUpToStep(value: number, step: number): number {
  const rounded = round(value, 6);
  if (rounded <= 0 || step <= 0) return 0;
  const steps = Math.ceil(round(rounded / step, 6));
  return round(steps * step, 4);
}

const foodKeys: FoodKey[] = ['pizza', 'sandwich', 'hotdog'];

export function shareSum(shares: MenuShares): number {
  return foodKeys.reduce((total, key) => total + shares[key], 0);
}

export function equivalentServings(children: number, adults: number, childFactor: number): number {
  return round(adults + children * childFactor, 4);
}

export function calculateFood(input: CalcInput): FoodComputation {
  const { assumptions: a } = input;
  const people = input.children + input.adults;
  const notes: string[] = [];
  const shareTotal = shareSum(input.shares);
  const shareError =
    shareTotal !== 100
      ? `Los porcentajes del menú suman ${formatQty(shareTotal)} %. Tienen que sumar 100 % para repartir la comida salada.`
      : null;

  if (people === 0) {
    return {
      valid: true,
      message:
        'Sin chicos ni adultos el cálculo da cero. Cargá los asistentes cuando tengas una estimación: podés corregirla después.',
      shareError,
      zeroAttendees: true,
      equivalentServings: 0,
      lines: [],
      beverageConsumptionLiters: 0,
      beveragePurchaseLiters: 0,
      notes: [
        'Con cero asistentes no se estiman pizzas, sándwiches, panchos, torta ni bebidas.',
        'Estos números son supuestos de planificación, no una recomendación nutricional.',
      ],
    };
  }

  const servings = equivalentServings(input.children, input.adults, a.childFactor);
  const contingency = 1 + input.contingencyPercent / 100;
  notes.push(
    `Porciones saladas equivalentes: ${formatQty(input.adults)} adultos + ${formatQty(input.children)} chicos × ${formatQty(a.childFactor)} = ${formatQty(servings)}.`,
  );
  notes.push(
    input.servingStyle === 'merienda'
      ? 'Estilo merienda: los alimentos salados son alternativas, no una comida encima de otra.'
      : 'Estilo comida principal: los alimentos salados son alternativas, no platos que se suman entre sí.',
  );
  notes.push(
    `Margen del ${formatQty(input.contingencyPercent)} % aplicado una sola vez a cada total, antes de redondear la compra.`,
  );
  notes.push('La duración no multiplica la comida salada ni la torta. En este modelo solo entra en las bebidas.');

  const lines: FoodLine[] = [];
  if (!shareError) {
    for (const key of foodKeys) {
      const share = input.shares[key];
      if (share <= 0) continue;
      const coeff = a.savoryPerServing[input.servingStyle][key];
      const allocated = round(servings * (share / 100), 4);
      const rawUnits = round(allocated * coeff * contingency, 4);
      if (key === 'pizza') {
        const pizzas = ceilDiv(rawUnits, a.pizzaSlicesPerPizza);
        lines.push({
          key,
          sourceId: 'calc:pizza',
          label: 'Pizzas',
          category: 'comida',
          consumption: rawUnits,
          consumptionUnit: 'porciones',
          purchase: pizzas,
          purchaseUnit: 'pizza',
          detail: `${formatQty(rawUnits)} porciones, en pizzas de ${formatQty(a.pizzaSlicesPerPizza)}.`,
        });
      } else if (key === 'sandwich') {
        lines.push({
          key,
          sourceId: 'calc:sandwich',
          label: 'Sándwiches',
          category: 'comida',
          consumption: rawUnits,
          consumptionUnit: 'unidad',
          purchase: ceilCount(rawUnits),
          purchaseUnit: 'unidad',
          detail: 'Unidades chicas, redondeadas hacia arriba.',
        });
      } else {
        lines.push({
          key,
          sourceId: 'calc:hotdog',
          label: 'Panchos',
          category: 'comida',
          consumption: rawUnits,
          consumptionUnit: 'unidad',
          purchase: ceilCount(rawUnits),
          purchaseUnit: 'unidad',
          detail: 'Unidades chicas, redondeadas hacia arriba.',
        });
      }
    }
  }

  const cakeRaw = round(
    (input.children * a.cakeKgPerChild + input.adults * a.cakeKgPerAdult) * contingency,
    4,
  );
  const cakePurchase = roundUpToStep(cakeRaw, a.cakeIncrementKg);
  lines.push({
    key: 'cake',
    sourceId: 'calc:cake',
    label: 'Torta',
    category: 'torta',
    consumption: cakeRaw,
    consumptionUnit: 'kg',
    purchase: cakePurchase,
    purchaseUnit: 'kg',
    detail: `Redondeo de compra en pasos de ${formatQty(a.cakeIncrementKg)} kg.`,
  });

  const drinkRaw = round(
    (input.children * a.drinkLitersPerChildPerHour + input.adults * a.drinkLitersPerAdultPerHour) *
      input.hours *
      contingency,
    4,
  );
  const waterLiters = round(drinkRaw * (a.waterPercent / 100), 4);
  const otherLiters = round(drinkRaw - waterLiters, 4);
  const waterContainers = ceilDiv(waterLiters, a.packageLiters);
  const otherContainers = ceilDiv(otherLiters, a.packageLiters);
  const purchaseLiters = round((waterContainers + otherContainers) * a.packageLiters, 4);

  lines.push({
    key: 'water',
    sourceId: 'calc:water',
    label: 'Agua',
    category: 'bebidas',
    consumption: waterLiters,
    consumptionUnit: 'L',
    purchase: waterContainers,
    purchaseUnit: 'envase',
    detail: `${formatQty(waterLiters)} L de consumo, en envases de ${formatQty(a.packageLiters)} L.`,
  });
  lines.push({
    key: 'otherDrink',
    sourceId: 'calc:other-drink',
    label: 'Otras bebidas',
    category: 'bebidas',
    consumption: otherLiters,
    consumptionUnit: 'L',
    purchase: otherContainers,
    purchaseUnit: 'envase',
    detail: `${formatQty(otherLiters)} L de consumo. El agua y el resto salen de un solo total, no de dos totales completos.`,
  });

  if (a.snacksEnabled) {
    const snacks = round(servings * a.snackUnitsPerServing * contingency, 4);
    lines.push({
      key: 'snack',
      sourceId: 'calc:snack',
      label: 'Snacks',
      category: 'comida',
      consumption: snacks,
      consumptionUnit: 'unidad',
      purchase: ceilCount(snacks),
      purchaseUnit: 'unidad',
      detail: 'Extra aparte de la comida salada. No reemplaza sándwiches, pizza ni panchos.',
    });
    notes.push('Los snacks están activados como adicional. No forman parte de la comida salada.');
  }

  notes.push(
    `Bebidas: ${formatQty(drinkRaw)} L de consumo estimado y ${formatQty(purchaseLiters)} L si comprás los envases completos.`,
  );
  notes.push('No hay bebidas con alcohol en este cálculo inicial.');
  notes.push('Estimación orientativa. El apetito, las edades, el clima, el menú y la duración cambian lo que se consume.');

  return {
    valid: true,
    message: null,
    shareError,
    zeroAttendees: false,
    equivalentServings: servings,
    lines,
    beverageConsumptionLiters: drinkRaw,
    beveragePurchaseLiters: purchaseLiters,
    notes,
  };
}

export type DisplayLine = FoodLine & {
  adjusted: boolean;
  needsReview: boolean;
  recalculatedPurchase: number;
};

export function applyPurchaseOverrides(
  computation: FoodComputation,
  overrides: CalculatorState['overrides'],
): DisplayLine[] {
  return computation.lines.map((line) => {
    const override = overrides[line.key];
    if (!override) {
      return { ...line, adjusted: false, needsReview: false, recalculatedPurchase: line.purchase };
    }
    return {
      ...line,
      purchase: override.value,
      adjusted: true,
      needsReview: override.calculatedWhenSet !== line.purchase,
      recalculatedPurchase: line.purchase,
    };
  });
}

export function workedExampleInput(): CalcInput {
  return {
    children: 20,
    adults: 10,
    hours: 3,
    servingStyle: 'merienda',
    contingencyPercent: 10,
    shares: { pizza: 0, sandwich: 100, hotdog: 0 },
    assumptions: defaultAssumptions(),
  };
}

export function lineByKey(computation: FoodComputation, key: FoodLine['key']): FoodLine | undefined {
  return computation.lines.find((line) => line.key === key);
}
