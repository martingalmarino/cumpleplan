import type { Assumptions, FoodKey, Season, ServingStyle } from '../lib/planner/types';

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
    merienda: { pizza: 1.5, sandwichMiga: 5, sandwichGrande: 1, hotdog: 1.5 },
    'comida-principal': { pizza: 3, sandwichMiga: 8, sandwichGrande: 2, hotdog: 2 },
  };
  const seasonMultiplier: Record<Season, number> = {
    verano: 1.3,
    invierno: 1.0,
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
    waterPercent: 30,
    sodaPercent: 40,
    juicePercent: 30,
    packageLiters: 2,
    snackSaltyUnitsPerChild: 1,
    snackSweetUnitsPerChild: 1,
    empanadaUnitsPerAdult: 2,
    coffeeEnabled: true,
    coffeeCupsPerAdult: 1,
    seasonalDrinkMultiplier: seasonMultiplier,
  };
}
