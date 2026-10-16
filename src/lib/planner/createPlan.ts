import { defaultAssumptions } from '../../config/calculator';
import { seedTasks } from './checklist';
import { createId } from './ids';
import { SCHEMA_VERSION, type Plan } from './types';

export function createPlan(now = new Date().toISOString()): Plan {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: createId('plan'),
    updatedAt: now,
    event: {
      label: 'Mi cumple',
      date: null,
      age: null,
      setting: 'casa',
      province: 'Córdoba',
      durationHours: 3,
      childrenCount: 0,
      adultsCount: 0,
      budgetTargetCentavos: null,
    },
    calculator: {
      servingStyle: 'merienda',
      season: 'verano',
      contingencyPercent: 0,
      shares: { pizza: 0, sandwichMiga: 100, sandwichGrande: 0, hotdog: 0 },
      assumptions: defaultAssumptions(),
      overrides: {},
    },
    budgetLines: [],
    quotes: [],
    tasks: seedTasks(),
    shoppingItems: [],
  };
}
