import { defaultAssumptions } from '../../config/calculator';
import { formatQty } from './money';
import type { Assumptions, CalculatorState, FoodKey, FoodLine, MenuShares, Season, ServingStyle } from './types';

export type CalcInput = {
  children: number;
  adults: number;
  hours: number;
  servingStyle: ServingStyle;
  season: Season;
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

const foodKeys: FoodKey[] = ['pizza', 'sandwichMiga', 'sandwichGrande', 'hotdog'];

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
      } else if (key === 'sandwichMiga') {
        lines.push({
          key,
          sourceId: 'calc:sandwich-miga',
          label: 'Sándwiches de miga',
          category: 'comida',
          consumption: rawUnits,
          consumptionUnit: 'unidad',
          purchase: ceilCount(rawUnits),
          purchaseUnit: 'unidad',
          detail: 'Sándwiches de miga triangulares chicos.',
        });
      } else if (key === 'sandwichGrande') {
        lines.push({
          key,
          sourceId: 'calc:sandwich-grande',
          label: 'Sándwiches grandes / Pebetes',
          category: 'comida',
          consumption: rawUnits,
          consumptionUnit: 'unidad',
          purchase: ceilCount(rawUnits),
          purchaseUnit: 'unidad',
          detail: 'Sándwiches grandes, tipo pebete.',
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
          detail: 'Panchos chicos.',
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

  const seasonMultiplier = a.seasonalDrinkMultiplier[input.season];
  const drinkRaw = round(
    (input.children * a.drinkLitersPerChildPerHour + input.adults * a.drinkLitersPerAdultPerHour) *
      input.hours *
      seasonMultiplier *
      contingency,
    4,
  );
  const waterLiters = round(drinkRaw * (a.waterPercent / 100), 4);
  const sodaLiters = round(drinkRaw * (a.sodaPercent / 100), 4);
  const juiceLiters = round(drinkRaw * (a.juicePercent / 100), 4);
  const waterContainers = ceilDiv(waterLiters, a.packageLiters);
  const sodaContainers = ceilDiv(sodaLiters, a.packageLiters);
  const juiceContainers = ceilDiv(juiceLiters, a.packageLiters);
  const purchaseLiters = round((waterContainers + sodaContainers + juiceContainers) * a.packageLiters, 4);

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
    key: 'soda',
    sourceId: 'calc:soda',
    label: 'Gaseosa',
    category: 'bebidas',
    consumption: sodaLiters,
    consumptionUnit: 'L',
    purchase: sodaContainers,
    purchaseUnit: 'envase',
    detail: `${formatQty(sodaLiters)} L de consumo, en envases de ${formatQty(a.packageLiters)} L.`,
  });
  lines.push({
    key: 'juice',
    sourceId: 'calc:juice',
    label: 'Jugo',
    category: 'bebidas',
    consumption: juiceLiters,
    consumptionUnit: 'L',
    purchase: juiceContainers,
    purchaseUnit: 'envase',
    detail: `${formatQty(juiceLiters)} L de consumo, en envases de ${formatQty(a.packageLiters)} L.`,
  });

  if (a.snackSaltyUnitsPerChild > 0) {
    const snacksSalty = round(input.children * a.snackSaltyUnitsPerChild * contingency, 4);
    lines.push({
      key: 'snackSalty',
      sourceId: 'calc:snack-salty',
      label: 'Snacks salados (papas, chizitos)',
      category: 'comida',
      consumption: snacksSalty,
      consumptionUnit: 'paquete',
      purchase: ceilCount(snacksSalty),
      purchaseUnit: 'paquete',
      detail: 'Paquetes individuales por chico. Extra aparte de la comida salada.',
    });
  }

  if (a.snackSweetUnitsPerChild > 0) {
    const snacksSweet = round(input.children * a.snackSweetUnitsPerChild * contingency, 4);
    lines.push({
      key: 'snackSweet',
      sourceId: 'calc:snack-sweet',
      label: 'Golosinas / Bolsitas sorpresa',
      category: 'souvenirs',
      consumption: snacksSweet,
      consumptionUnit: 'bolsita',
      purchase: ceilCount(snacksSweet),
      purchaseUnit: 'bolsita',
      detail: 'Bolsitas sorpresa o golosinas por chico.',
    });
  }

  if (a.empanadaUnitsPerAdult > 0 && input.adults > 0) {
    const empanadas = round(input.adults * a.empanadaUnitsPerAdult * contingency, 4);
    lines.push({
      key: 'empanada',
      sourceId: 'calc:empanada',
      label: 'Empanadas / Picada para adultos',
      category: 'comida',
      consumption: empanadas,
      consumptionUnit: 'unidad',
      purchase: ceilCount(empanadas),
      purchaseUnit: 'unidad',
      detail: 'Empanadas o picada para adultos. Opcional según el evento.',
    });
  }

  if (a.coffeeEnabled && input.adults > 0) {
    const coffee = round(input.adults * a.coffeeCupsPerAdult * contingency, 4);
    lines.push({
      key: 'coffee',
      sourceId: 'calc:coffee',
      label: 'Café / Mate para adultos',
      category: 'bebidas',
      consumption: coffee,
      consumptionUnit: 'porción',
      purchase: ceilCount(coffee),
      purchaseUnit: 'porción',
      detail: 'Café o mate para adultos.',
    });
  }

  notes.push(
    `Bebidas: ${formatQty(drinkRaw)} L de consumo estimado (ajustado por temporada ${input.season}) y ${formatQty(purchaseLiters)} L si comprás los envases completos.`,
  );
  notes.push('No hay bebidas con alcohol en este cálculo inicial.');
  notes.push('Snacks salados, golosinas, empanadas y café son extras opcionales según tu evento.');
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
    season: 'verano',
    contingencyPercent: 10,
    shares: { pizza: 0, sandwichMiga: 100, sandwichGrande: 0, hotdog: 0 },
    assumptions: defaultAssumptions(),
  };
}

export function lineByKey(computation: FoodComputation, key: FoodLine['key']): FoodLine | undefined {
  return computation.lines.find((line) => line.key === key);
}
