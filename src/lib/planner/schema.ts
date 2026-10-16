import { plannerLimits } from '../../config/calculator';
import { isValidCalendarDate } from './dates';
import { paymentError } from './budget';
import { SCHEMA_VERSION, type BudgetCategory, type FoodKey, type Plan, type Quote, type Season, type ServingStyle } from './types';

const UNSAFE = new Set(['__proto__', 'prototype', 'constructor']);
const settings = new Set(['casa', 'salon', 'aire-libre']);
const styles = new Set<ServingStyle>(['merienda', 'comida-principal']);
const seasons = new Set<Season>(['verano', 'invierno']);
const foods: FoodKey[] = ['pizza', 'sandwichMiga', 'sandwichGrande', 'hotdog'];
const categories = new Set<BudgetCategory>([
  'lugar',
  'comida',
  'bebidas',
  'torta',
  'decoracion',
  'animacion',
  'souvenirs',
  'descartables',
  'otros',
]);
const applies = new Set(['children', 'adults', 'both']);
const overrideKeys = new Set(['pizza', 'sandwichMiga', 'sandwichGrande', 'hotdog', 'cake', 'water', 'soda', 'juice', 'snackSalty', 'snackSweet', 'empanada', 'coffee']);

export type BackupPreview = {
  label: string;
  date: string | null;
  children: number;
  adults: number;
  budgetLines: number;
  quotes: number;
  tasks: number;
  doneTasks: number;
  shoppingItems: number;
  updatedAt: string;
};

export type BackupFailureKind = 'malformed' | 'unsafe' | 'future' | 'invalid' | 'size';

export type BackupResult =
  | { ok: true; plan: Plan; preview: BackupPreview }
  | { ok: false; error: string; kind: BackupFailureKind };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rejectUnsafe(value: unknown, depth = 0): string | null {
  if (depth > 8) return 'El plan guardado tiene demasiados niveles.';
  if (Array.isArray(value)) {
    if (value.length > 500) return 'El plan guardado tiene demasiados elementos.';
    for (const item of value) {
      const error = rejectUnsafe(item, depth + 1);
      if (error) return error;
    }
    return null;
  }
  if (isRecord(value)) {
    for (const key of Object.keys(value)) {
      if (UNSAFE.has(key)) return 'El plan guardado incluye campos no permitidos.';
      const error = rejectUnsafe(value[key], depth + 1);
      if (error) return error;
    }
  }
  return null;
}

function keysOf(value: Record<string, unknown>, allowed: string[]): string | null {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) return 'El plan guardado incluye campos que esta versión no reconoce.';
  }
  for (const key of allowed) {
    if (!(key in value)) return 'Al plan guardado le faltan datos.';
  }
  return null;
}

function text(value: unknown, max: number, label: string): string | null {
  if (typeof value !== 'string') return `${label} tiene un formato inválido.`;
  if (value.length > max) return `${label} es demasiado largo.`;
  return null;
}

function integer(value: unknown, min: number, max: number, label: string): string | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    return `${label} está fuera del rango permitido.`;
  }
  return null;
}

function finite(value: unknown, min: number, max: number, label: string): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    return `${label} está fuera del rango permitido.`;
  }
  return null;
}

function nullableInt(value: unknown, min: number, max: number, label: string): string | null {
  if (value === null) return null;
  return integer(value, min, max, label);
}

function id(value: unknown): string | null {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9:_-]{1,80}$/.test(value)) return 'Hay un identificador inválido.';
  return null;
}

function optionalDate(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || !isValidCalendarDate(value)) return `${label} no es una fecha válida.`;
  return null;
}

function assumptions(value: unknown): string | null {
  if (!isRecord(value)) return 'Los supuestos de cálculo no son válidos.';
  const error = keysOf(value, [
    'childFactor',
    'savoryPerServing',
    'pizzaSlicesPerPizza',
    'cakeKgPerChild',
    'cakeKgPerAdult',
    'cakeIncrementKg',
    'drinkLitersPerChildPerHour',
    'drinkLitersPerAdultPerHour',
    'waterPercent',
    'sodaPercent',
    'juicePercent',
    'packageLiters',
    'snackSaltyUnitsPerChild',
    'snackSweetUnitsPerChild',
    'empanadaUnitsPerAdult',
    'coffeeEnabled',
    'coffeeCupsPerAdult',
    'seasonalDrinkMultiplier',
  ]);
  if (error) return error;
  const checks = [
    finite(value.childFactor, 0.2, 1.5, 'El factor de chicos'),
    integer(value.pizzaSlicesPerPizza, 4, 16, 'Las porciones por pizza'),
    finite(value.cakeKgPerChild, 0, 1, 'La torta por chico'),
    finite(value.cakeKgPerAdult, 0, 1, 'La torta por adulto'),
    finite(value.cakeIncrementKg, 0.05, 1, 'El redondeo de la torta'),
    finite(value.drinkLitersPerChildPerHour, 0, 1, 'La bebida por chico'),
    finite(value.drinkLitersPerAdultPerHour, 0, 1, 'La bebida por adulto'),
    integer(value.waterPercent, 0, 100, 'El reparto de agua'),
    integer(value.sodaPercent, 0, 100, 'El reparto de gaseosa'),
    integer(value.juicePercent, 0, 100, 'El reparto de jugo'),
    finite(value.packageLiters, 0.25, 10, 'El envase'),
    finite(value.snackSaltyUnitsPerChild, 0, 10, 'Los snacks salados'),
    finite(value.snackSweetUnitsPerChild, 0, 10, 'Las golosinas'),
    finite(value.empanadaUnitsPerAdult, 0, 10, 'Las empanadas'),
    finite(value.coffeeCupsPerAdult, 0, 5, 'El café'),
  ];
  if (typeof value.coffeeEnabled !== 'boolean') return 'El adicional de café es inválido.';
  for (const check of checks) if (check) return check;
  if (!isRecord(value.savoryPerServing)) return 'Las porciones saladas no son válidas.';
  for (const style of styles) {
    const row = value.savoryPerServing[style];
    if (!isRecord(row)) return 'Las porciones saladas no son válidas.';
    for (const food of foods) {
      const portion = finite(row[food], 0, 20, 'Una porción salada');
      if (portion) return portion;
    }
  }
  if (!isRecord(value.seasonalDrinkMultiplier)) return 'Los multiplicadores de temporada no son válidos.';
  for (const season of seasons) {
    const multiplier = finite(value.seasonalDrinkMultiplier[season], 0.5, 2, 'Un multiplicador de temporada');
    if (multiplier) return multiplier;
  }
  return null;
}

function event(value: unknown): string | null {
  if (!isRecord(value)) return 'Los datos del evento no son válidos.';
  const error = keysOf(value, [
    'label',
    'date',
    'age',
    'setting',
    'durationHours',
    'childrenCount',
    'adultsCount',
    'budgetTargetCentavos',
  ]);
  if (error) return error;
  const label = text(value.label, plannerLimits.maxLabelLength, 'El nombre del cumple');
  if (label) return label;
  if (typeof value.label === 'string' && value.label.trim().length === 0) return 'El nombre del cumple está vacío.';
  const date = optionalDate(value.date, 'La fecha');
  if (date) return date;
  const age = nullableInt(value.age, plannerLimits.minAge, plannerLimits.maxAge, 'La edad');
  if (age) return age;
  if (typeof value.setting !== 'string' || !settings.has(value.setting)) return 'El lugar del cumple no es válido.';
  const duration = integer(value.durationHours, plannerLimits.minDuration, plannerLimits.maxDuration, 'La duración');
  if (duration) return duration;
  const children = integer(value.childrenCount, 0, plannerLimits.maxPerGroup, 'Los chicos');
  if (children) return children;
  const adults = integer(value.adultsCount, 0, plannerLimits.maxPerGroup, 'Los adultos');
  if (adults) return adults;
  if (
    typeof value.childrenCount === 'number' &&
    typeof value.adultsCount === 'number' &&
    value.childrenCount + value.adultsCount > plannerLimits.maxTotalPeople
  ) {
    return `El total de asistentes no puede pasar de ${plannerLimits.maxTotalPeople}.`;
  }
  if (value.budgetTargetCentavos !== null) {
    const target = integer(value.budgetTargetCentavos, 0, plannerLimits.maxCentavos, 'El objetivo');
    if (target) return target;
  }
  return null;
}

function calculator(value: unknown): string | null {
  if (!isRecord(value)) return 'La calculadora no es válida.';
  const error = keysOf(value, ['servingStyle', 'season', 'contingencyPercent', 'shares', 'assumptions', 'overrides']);
  if (error) return error;
  if (typeof value.servingStyle !== 'string' || !styles.has(value.servingStyle as ServingStyle)) {
    return 'El estilo de comida no es válido.';
  }
  if (typeof value.season !== 'string' || !seasons.has(value.season as Season)) {
    return 'La temporada no es válida.';
  }
  const contingency = integer(value.contingencyPercent, 0, plannerLimits.maxContingency, 'El margen');
  if (contingency) return contingency;
  if (!isRecord(value.shares)) return 'El menú no es válido.';
  let sum = 0;
  for (const food of foods) {
    const share = integer(value.shares[food], 0, 100, 'Un porcentaje del menú');
    if (share) return share;
    sum += value.shares[food] as number;
  }
  if (Object.keys(value.shares).some((key) => !foods.includes(key as FoodKey))) return 'El menú incluye un alimento desconocido.';
  if (sum !== 100) return 'Los porcentajes del menú tienen que sumar 100 %.';
  const assumptionError = assumptions(value.assumptions);
  if (assumptionError) return assumptionError;
  if (!isRecord(value.overrides)) return 'Los ajustes manuales no son válidos.';
  for (const [key, override] of Object.entries(value.overrides)) {
    if (!overrideKeys.has(key)) return 'Hay un ajuste manual desconocido.';
    if (!isRecord(override)) return 'Hay un ajuste manual inválido.';
    const overrideKeysError = keysOf(override, ['value', 'calculatedWhenSet']);
    if (overrideKeysError) return overrideKeysError;
    const current = finite(override.value, 0, 10000, 'Un ajuste manual');
    if (current) return current;
    const previous = finite(override.calculatedWhenSet, 0, 10000, 'Un ajuste manual');
    if (previous) return previous;
  }
  return null;
}

function budgetLine(value: unknown): string | null {
  if (!isRecord(value)) return 'Hay un gasto inválido.';
  const error = keysOf(value, [
    'id',
    'category',
    'description',
    'quantity',
    'unit',
    'unitPriceCentavos',
    'contractedCentavos',
    'paidCentavos',
    'notes',
    'shoppingSourceId',
    'shoppingItemId',
    'quoteGroupId',
    'sourceQuoteId',
    'excluded',
    'exclusionNote',
  ]);
  if (error) return error;
  if (id(value.id)) return 'Hay un gasto con identificador inválido.';
  if (typeof value.category !== 'string' || !categories.has(value.category as BudgetCategory)) return 'Hay un rubro inválido.';
  const description = text(value.description, 160, 'Una descripción');
  if (description) return description;
  const quantity = finite(value.quantity, 0, 10000, 'Una cantidad');
  if (quantity) return quantity;
  const unit = text(value.unit, 40, 'Una unidad');
  if (unit) return unit;
  for (const field of ['unitPriceCentavos', 'contractedCentavos'] as const) {
    if (value[field] !== null) {
      const money = integer(value[field], 0, plannerLimits.maxCentavos, 'Un importe');
      if (money) return money;
    }
  }
  const paid = integer(value.paidCentavos, 0, plannerLimits.maxCentavos, 'Un pago');
  if (paid) return paid;
  const pay = paymentError(
    value.paidCentavos as number,
    value.contractedCentavos as number | null,
  );
  if (pay) return pay;
  const notes = text(value.notes, plannerLimits.maxNoteLength, 'Una nota');
  if (notes) return notes;
  for (const field of ['shoppingSourceId', 'shoppingItemId', 'quoteGroupId', 'sourceQuoteId'] as const) {
    if (value[field] !== null && id(value[field])) return 'Hay un vínculo inválido en un gasto.';
  }
  if (typeof value.excluded !== 'boolean') return 'Hay un gasto con un estado inválido.';
  const exclusion = text(value.exclusionNote, 200, 'Una nota de cobertura');
  if (exclusion) return exclusion;
  return null;
}

function quote(value: unknown): string | null {
  if (!isRecord(value)) return 'Hay un presupuesto de proveedor inválido.';
  const error = keysOf(value, [
    'id',
    'groupId',
    'serviceName',
    'optionName',
    'fixedCentavos',
    'perPersonCentavos',
    'appliesTo',
    'transportCentavos',
    'extrasCentavos',
    'durationHours',
    'includedItems',
    'exclusions',
    'covers',
  ]);
  if (error) return error;
  if (id(value.id) || id(value.groupId)) return 'Hay un presupuesto con identificador inválido.';
  const service = text(value.serviceName, 80, 'El servicio');
  if (service) return service;
  const option = text(value.optionName, 80, 'La alternativa');
  if (option) return option;
  for (const field of ['fixedCentavos', 'perPersonCentavos', 'transportCentavos', 'extrasCentavos'] as const) {
    if (value[field] !== null) {
      const money = integer(value[field], 0, plannerLimits.maxCentavos, 'Un importe del presupuesto');
      if (money) return money;
    }
  }
  if (value.appliesTo !== null && (typeof value.appliesTo !== 'string' || !applies.has(value.appliesTo))) {
    return 'Indicá si el importe por persona aplica a chicos, adultos o ambos.';
  }
  if (value.durationHours !== null) {
    const duration = finite(value.durationHours, 0, 24, 'La duración de la alternativa');
    if (duration) return duration;
  }
  const included = text(value.includedItems, plannerLimits.maxNoteLength, 'Lo incluido');
  if (included) return included;
  const exclusions = text(value.exclusions, plannerLimits.maxNoteLength, 'Lo que no incluye');
  if (exclusions) return exclusions;
  if (!Array.isArray(value.covers) || value.covers.length > 9) return 'La cobertura del presupuesto es inválida.';
  for (const cover of value.covers) {
    if (typeof cover !== 'string' || !categories.has(cover as BudgetCategory)) return 'La cobertura del presupuesto es inválida.';
  }
  return null;
}

function task(value: unknown): string | null {
  if (!isRecord(value)) return 'Hay una tarea inválida.';
  const error = keysOf(value, ['id', 'title', 'note', 'offsetDays', 'dueOverride', 'done', 'origin']);
  if (error) return error;
  if (id(value.id)) return 'Hay una tarea con identificador inválido.';
  const title = text(value.title, 140, 'Una tarea');
  if (title) return title;
  if (typeof value.title === 'string' && value.title.trim().length === 0) return 'Hay una tarea sin título.';
  const note = text(value.note, plannerLimits.maxNoteLength, 'Una nota de tarea');
  if (note) return note;
  const offset = integer(value.offsetDays, -365, 30, 'La fecha relativa');
  if (offset) return offset;
  const due = optionalDate(value.dueOverride, 'La fecha de una tarea');
  if (due) return due;
  if (typeof value.done !== 'boolean') return 'El estado de una tarea es inválido.';
  if (value.origin !== 'seed' && value.origin !== 'custom') return 'El origen de una tarea es inválido.';
  return null;
}

function shoppingItem(value: unknown): string | null {
  if (!isRecord(value)) return 'Hay un ítem de compras inválido.';
  const error = keysOf(value, [
    'id',
    'sourceId',
    'category',
    'name',
    'quantity',
    'unit',
    'purchasedQuantity',
    'bought',
    'notes',
    'linkedBudgetLineId',
    'reviewFlag',
    'removedFromMenu',
    'userEdited',
  ]);
  if (error) return error;
  if (id(value.id)) return 'Hay un ítem con identificador inválido.';
  if (value.sourceId !== null && id(value.sourceId)) return 'Hay un ítem con origen inválido.';
  if (typeof value.category !== 'string' || !categories.has(value.category as BudgetCategory)) return 'Hay un ítem con rubro inválido.';
  const name = text(value.name, 140, 'Un ítem');
  if (name) return name;
  const quantity = finite(value.quantity, 0, 10000, 'Una cantidad de compra');
  if (quantity) return quantity;
  const unit = text(value.unit, 40, 'Una unidad de compra');
  if (unit) return unit;
  const purchased = finite(value.purchasedQuantity, 0, 10000, 'La cantidad comprada');
  if (purchased) return purchased;
  if (typeof value.bought !== 'boolean' || typeof value.removedFromMenu !== 'boolean' || typeof value.userEdited !== 'boolean') {
    return 'Hay un ítem con un estado inválido.';
  }
  const notes = text(value.notes, plannerLimits.maxNoteLength, 'Una nota de compra');
  if (notes) return notes;
  if (value.linkedBudgetLineId !== null && id(value.linkedBudgetLineId)) return 'Hay un ítem mal vinculado al presupuesto.';
  if (value.reviewFlag !== null && value.reviewFlag !== 'quantity-changed' && value.reviewFlag !== 'removed-from-menu') {
    return 'Hay un aviso de compra inválido.';
  }
  return null;
}

export function validatePlan(value: unknown): { ok: true; plan: Plan } | { ok: false; error: string; kind: BackupFailureKind } {
  const unsafe = rejectUnsafe(value);
  if (unsafe) return { ok: false, error: unsafe, kind: unsafe.includes('no permitidos') ? 'unsafe' : 'invalid' };
  if (!isRecord(value)) return { ok: false, error: 'No encontramos un plan en lo guardado.', kind: 'malformed' };
  if (typeof value.schemaVersion === 'number' && value.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, error: 'El plan guardado es de una versión más nueva del sitio.', kind: 'future' };
  }
  const keyError = keysOf(value, [
    'schemaVersion',
    'id',
    'updatedAt',
    'event',
    'calculator',
    'budgetLines',
    'quotes',
    'tasks',
    'shoppingItems',
  ]);
  if (keyError) return { ok: false, error: keyError, kind: 'invalid' };
  if (value.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, error: 'La versión del plan guardado no es compatible.', kind: 'invalid' };
  }
  if (id(value.id)) return { ok: false, error: 'El plan no tiene un identificador válido.', kind: 'invalid' };
  if (typeof value.updatedAt !== 'string' || Number.isNaN(Date.parse(value.updatedAt))) {
    return { ok: false, error: 'La fecha de actualización no es válida.', kind: 'invalid' };
  }
  for (const check of [event(value.event), calculator(value.calculator)]) {
    if (check) return { ok: false, error: check, kind: 'invalid' };
  }
  const collections: Array<[unknown, number, (item: unknown) => string | null, string]> = [
    [value.budgetLines, plannerLimits.maxItems, budgetLine, 'gastos'],
    [value.quotes, 60, quote, 'presupuestos'],
    [value.tasks, plannerLimits.maxItems, task, 'tareas'],
    [value.shoppingItems, plannerLimits.maxItems, shoppingItem, 'compras'],
  ];
  for (const [collection, max, validate, label] of collections) {
    if (!Array.isArray(collection)) return { ok: false, error: `La lista de ${label} no es válida.`, kind: 'invalid' };
    if (collection.length > max) return { ok: false, error: `Hay demasiados ${label}.`, kind: 'invalid' };
    const seen = new Set<string>();
    for (const item of collection) {
      const itemError = validate(item);
      if (itemError) return { ok: false, error: itemError, kind: 'invalid' };
      const itemId = (item as { id: string }).id;
      if (seen.has(itemId)) return { ok: false, error: `Hay ${label} repetidos.`, kind: 'invalid' };
      seen.add(itemId);
    }
  }
  const quotes = value.quotes as Quote[];
  const groups = new Map<string, number>();
  for (const item of quotes) {
    groups.set(item.groupId, (groups.get(item.groupId) ?? 0) + 1);
  }
  for (const count of groups.values()) {
    if (count > 3) {
      return { ok: false, error: 'Cada servicio puede tener hasta tres alternativas.', kind: 'invalid' };
    }
  }
  return { ok: true, plan: value as unknown as Plan };
}

export function previewPlan(plan: Plan): BackupPreview {
  return {
    label: plan.event.label,
    date: plan.event.date,
    children: plan.event.childrenCount,
    adults: plan.event.adultsCount,
    budgetLines: plan.budgetLines.length,
    quotes: plan.quotes.length,
    tasks: plan.tasks.length,
    doneTasks: plan.tasks.filter((item) => item.done).length,
    shoppingItems: plan.shoppingItems.length,
    updatedAt: plan.updatedAt,
  };
}

export function parseBackup(text: string): BackupResult {
  if (text.length > plannerLimits.maxBackupChars) {
    return { ok: false, error: 'El plan guardado es demasiado grande.', kind: 'size' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El plan guardado está dañado.', kind: 'malformed' };
  }
  const result = validatePlan(parsed);
  if (!result.ok) return result;
  return { ok: true, plan: result.plan, preview: previewPlan(result.plan) };
}
