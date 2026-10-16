import { defaultAssumptions } from '../../config/calculator';
import { blankBudgetLine, suggestedBudgetLines } from './budget';
import { seedTasks } from './checklist';
import { createId } from './ids';
import { suggestedShoppingItems } from './shopping';
import { SCHEMA_VERSION, type Plan } from './types';

export function createPlan(now = new Date().toISOString()): Plan {
  // Líneas de presupuesto sugeridas con montos vacíos
  const budgetLines = suggestedBudgetLines().map((suggestion) => {
    const line = blankBudgetLine(createId('budget'), suggestion.category);
    line.description = suggestion.description;
    line.unit = suggestion.unit;
    return line;
  });

  // Items de compras sugeridos (cantidad inicial para ~20 invitados)
  const estimatedGuests = 20;
  const shoppingItems = suggestedShoppingItems(estimatedGuests).map((item) => ({
    id: createId('shop'),
    sourceId: item.sourceId,
    category: item.category,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    purchasedQuantity: 0,
    bought: false,
    notes: '',
    linkedBudgetLineId: null,
    reviewFlag: null,
    removedFromMenu: false,
    userEdited: false,
  }));

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
    budgetLines,
    quotes: [],
    tasks: seedTasks(),
    shoppingItems,
  };
}
