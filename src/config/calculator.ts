import type { Assumptions, FoodKey, ServingStyle } from '../lib/planner/types';

export const plannerLimits = {
  maxPerGroup: 300,
  maxTotalPeople: 400,
  minDuration: 1,
  maxDuration: 8,
  maxContingency: 30,
  minAge: 1,
  maxAge: 18,
  maxLabelLength: 80,
  maxNoteLength: 500,
  maxItems: 200,
  maxBackupChars: 350_000,
  maxCentavos: 100_000_000_000,
} as const;

export function defaultAssumptions(): Assumptions {
  const savory: Record<ServingStyle, Record<FoodKey, number>> = {
    merienda: { pizza: 1.5, sandwich: 1, hotdog: 1 },
    'comida-principal': { pizza: 3, sandwich: 2, hotdog: 2 },
  };
  return {
    childFactor: 0.6,
    savoryPerServing: savory,
    pizzaSlicesPerPizza: 8,
    cakeKgPerChild: 0.1,
    cakeKgPerAdult: 0.12,
    cakeIncrementKg: 0.25,
    drinkLitersPerChildPerHour: 0.15,
    drinkLitersPerAdultPerHour: 0.2,
    waterPercent: 50,
    packageLiters: 2,
    snacksEnabled: false,
    snackUnitsPerServing: 1,
  };
}
