export const SCHEMA_VERSION = 1 as const;

export type Setting = 'casa' | 'salon' | 'aire-libre';
export type ServingStyle = 'merienda' | 'comida-principal';
export type FoodKey = 'pizza' | 'sandwich' | 'hotdog';
export type BudgetCategory =
  | 'lugar'
  | 'comida'
  | 'bebidas'
  | 'torta'
  | 'decoracion'
  | 'animacion'
  | 'souvenirs'
  | 'descartables'
  | 'otros';

export type OverrideKey = FoodKey | 'cake' | 'water' | 'otherDrink' | 'snack';

export type EventDetails = {
  label: string;
  date: string | null;
  age: number | null;
  setting: Setting;
  durationHours: number;
  childrenCount: number;
  adultsCount: number;
  budgetTargetCentavos: number | null;
};

export type MenuShares = Record<FoodKey, number>;

export type Assumptions = {
  childFactor: number;
  savoryPerServing: Record<ServingStyle, Record<FoodKey, number>>;
  pizzaSlicesPerPizza: number;
  cakeKgPerChild: number;
  cakeKgPerAdult: number;
  cakeIncrementKg: number;
  drinkLitersPerChildPerHour: number;
  drinkLitersPerAdultPerHour: number;
  waterPercent: number;
  packageLiters: number;
  snacksEnabled: boolean;
  snackUnitsPerServing: number;
};

export type PurchaseOverride = {
  value: number;
  calculatedWhenSet: number;
};

export type CalculatorState = {
  servingStyle: ServingStyle;
  contingencyPercent: number;
  shares: MenuShares;
  assumptions: Assumptions;
  overrides: Partial<Record<OverrideKey, PurchaseOverride>>;
};

export type BudgetLine = {
  id: string;
  category: BudgetCategory;
  description: string;
  quantity: number;
  unit: string;
  unitPriceCentavos: number | null;
  contractedCentavos: number | null;
  paidCentavos: number;
  notes: string;
  shoppingSourceId: string | null;
  shoppingItemId: string | null;
  quoteGroupId: string | null;
  sourceQuoteId: string | null;
  excluded: boolean;
  exclusionNote: string;
};

export type QuoteAppliesTo = 'children' | 'adults' | 'both';

export type Quote = {
  id: string;
  groupId: string;
  serviceName: string;
  optionName: string;
  fixedCentavos: number | null;
  perPersonCentavos: number | null;
  appliesTo: QuoteAppliesTo | null;
  transportCentavos: number | null;
  extrasCentavos: number | null;
  durationHours: number | null;
  includedItems: string;
  exclusions: string;
  covers: BudgetCategory[];
};

export type Task = {
  id: string;
  title: string;
  note: string;
  offsetDays: number;
  dueOverride: string | null;
  done: boolean;
  origin: 'seed' | 'custom';
};

export type ReviewFlag = 'quantity-changed' | 'removed-from-menu';

export type ShoppingItem = {
  id: string;
  sourceId: string | null;
  category: BudgetCategory;
  name: string;
  quantity: number;
  unit: string;
  purchasedQuantity: number;
  bought: boolean;
  notes: string;
  linkedBudgetLineId: string | null;
  reviewFlag: ReviewFlag | null;
  removedFromMenu: boolean;
  userEdited: boolean;
};

export type Plan = {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  updatedAt: string;
  event: EventDetails;
  calculator: CalculatorState;
  budgetLines: BudgetLine[];
  quotes: Quote[];
  tasks: Task[];
  shoppingItems: ShoppingItem[];
};

export type FoodLineKey = OverrideKey;

export type FoodLine = {
  key: FoodLineKey;
  sourceId: string;
  label: string;
  category: BudgetCategory;
  consumption: number;
  consumptionUnit: string;
  purchase: number;
  purchaseUnit: string;
  detail: string;
};
