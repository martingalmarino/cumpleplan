import type { BudgetCategory, FoodKey, Season, Setting, ServingStyle } from './types';

export const categoryLabels: Record<BudgetCategory, string> = {
  lugar: 'Lugar',
  comida: 'Comida',
  bebidas: 'Bebidas',
  torta: 'Torta',
  decoracion: 'Decoración',
  animacion: 'Animación',
  souvenirs: 'Souvenirs',
  descartables: 'Descartables',
  otros: 'Otros',
};

export const categoryOrder: BudgetCategory[] = [
  'lugar',
  'comida',
  'bebidas',
  'torta',
  'decoracion',
  'animacion',
  'souvenirs',
  'descartables',
  'otros',
];

export const settingLabels: Record<Setting, string> = {
  casa: 'Casa',
  salon: 'Salón',
  'aire-libre': 'Aire libre',
};

export const servingLabels: Record<ServingStyle, string> = {
  merienda: 'Merienda',
  'comida-principal': 'Comida principal',
};

export const seasonLabels: Record<Season, string> = {
  verano: 'Verano',
  invierno: 'Invierno',
};

export const foodLabels: Record<FoodKey, string> = {
  pizza: 'Pizza',
  sandwichMiga: 'Sándwiches de miga',
  sandwichGrande: 'Sándwiches grandes / Pebetes',
  hotdog: 'Panchos',
};

export const toolLinks = [
  { href: '/organizador/', label: 'Plan', view: 'resumen' },
  { href: '/calculadora-comida-cumpleanos/', label: 'Comida y bebida', view: 'comida' },
  { href: '/presupuesto-cumpleanos/', label: 'Presupuesto', view: 'presupuesto' },
  { href: '/checklist-cumpleanos/', label: 'Checklist', view: 'checklist' },
  { href: '/lista-compras-cumpleanos/', label: 'Compras', view: 'compras' },
] as const;
