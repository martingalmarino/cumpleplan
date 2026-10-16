import { describe, it, expect } from 'vitest';
import {
  encodePlanToUrl,
  decodePlanFromUrl,
  formatShoppingForWhatsApp,
  formatChecklistForWhatsApp,
  getWhatsAppUrl,
} from '../src/lib/sharing';
import type { Plan, ShoppingItem, Task } from '../src/lib/planner/types';
import { createPlan } from '../src/lib/planner/createPlan';

describe('sharing', () => {
  describe('encodePlanToUrl and decodePlanFromUrl', () => {
    it('encodes and decodes a plan correctly', () => {
      const plan = createPlan();
      plan.event.childrenCount = 20;
      plan.event.adultsCount = 10;
      plan.event.label = 'Cumple de Juan';

      const encoded = encodePlanToUrl(plan);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');

      const result = decodePlanFromUrl(encoded);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.plan.event.childrenCount).toBe(20);
        expect(result.plan.event.adultsCount).toBe(10);
        expect(result.plan.event.label).toBe('Cumple de Juan');
      }
    });

    it('handles # prefix in hash', () => {
      const plan = createPlan();
      const encoded = encodePlanToUrl(plan);
      const result = decodePlanFromUrl('#' + encoded);
      expect(result.ok).toBe(true);
    });

    it('returns error for empty hash', () => {
      const result = decodePlanFromUrl('');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('malformed');
      }
    });

    it('returns error for invalid hash', () => {
      const result = decodePlanFromUrl('invalid-data-xyz');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('malformed');
      }
    });

    it('validates schema version', async () => {
      const plan = createPlan();
      const encoded = encodePlanToUrl(plan);
      
      // Modificar el plan decodificado para tener una versión no soportada
      const LZString = (await import('lz-string')).default;
      const decoded = JSON.parse(
        LZString.decompressFromEncodedURIComponent(encoded) as string
      );
      decoded.version = 999;
      
      const reencoded = LZString.compressToEncodedURIComponent(JSON.stringify(decoded));
      const result = decodePlanFromUrl(reencoded);
      
      expect(result.ok).toBe(false);
    });
  });

  describe('formatShoppingForWhatsApp', () => {
    const createShoppingItems = (): ShoppingItem[] => [
      {
        id: '1',
        name: 'Coca Cola',
        quantity: 10,
        unit: 'botellas',
        category: 'Bebidas',
        bought: false,
        removedFromMenu: false,
        generatedFrom: null,
      },
      {
        id: '2',
        name: 'Sándwiches',
        quantity: 50,
        unit: 'unidades',
        category: 'Comida',
        bought: true,
        removedFromMenu: false,
        generatedFrom: null,
      },
      {
        id: '3',
        name: 'Platos',
        quantity: 30,
        unit: 'unidades',
        category: 'Descartables',
        bought: false,
        removedFromMenu: false,
        generatedFrom: null,
      },
      {
        id: '4',
        name: 'Item removido',
        quantity: 5,
        unit: 'unidades',
        category: 'Otros',
        bought: false,
        removedFromMenu: true,
        generatedFrom: null,
      },
    ];

    it('formats shopping list with all items', () => {
      const items = createShoppingItems();
      const text = formatShoppingForWhatsApp(items, false);

      expect(text).toContain('📋 *Lista de compras*');
      expect(text).toContain('*Bebidas*');
      expect(text).toContain('⬜ Coca Cola: 10 botellas');
      expect(text).toContain('*Comida*');
      expect(text).toContain('✅ Sándwiches: 50 unidades');
      expect(text).toContain('*Descartables*');
      expect(text).toContain('⬜ Platos: 30 unidades');
      expect(text).not.toContain('Item removido');
    });

    it('formats shopping list with pending items only', () => {
      const items = createShoppingItems();
      const text = formatShoppingForWhatsApp(items, true);

      expect(text).toContain('📋 *Lista de compras*');
      expect(text).toContain('⬜ Coca Cola: 10 botellas');
      expect(text).not.toContain('Sándwiches');
      expect(text).toContain('⬜ Platos: 30 unidades');
    });

    it('handles empty list', () => {
      const text = formatShoppingForWhatsApp([], false);
      expect(text).toContain('Lista vacía');
    });

    it('handles empty pending list', () => {
      const items = createShoppingItems().map((item) => ({ ...item, bought: true }));
      const text = formatShoppingForWhatsApp(items, true);
      expect(text).toContain('No hay items pendientes');
    });

    it('truncates long lists', () => {
      const items: ShoppingItem[] = Array.from({ length: 200 }, (_, i) => ({
        id: String(i),
        name: `Item ${i} con un nombre muy largo para ocupar más espacio`,
        quantity: i,
        unit: 'unidades',
        category: 'Categoría larga con mucho texto',
        bought: false,
        removedFromMenu: false,
        generatedFrom: null,
      }));

      const text = formatShoppingForWhatsApp(items, false);
      expect(text.length).toBeLessThanOrEqual(2000);
      expect(text).toContain('truncada');
    });
  });

  describe('formatChecklistForWhatsApp', () => {
    const createTasks = (): Task[] => [
      {
        id: '1',
        title: 'Reservar salón',
        offsetDays: -30,
        done: false,
        fixed: false,
      },
      {
        id: '2',
        title: 'Comprar torta',
        offsetDays: -1,
        done: true,
        fixed: false,
      },
      {
        id: '3',
        title: 'Decorar',
        offsetDays: 0,
        done: false,
        fixed: false,
      },
    ];

    it('formats checklist with all tasks', () => {
      const tasks = createTasks();
      const text = formatChecklistForWhatsApp(tasks, '2026-12-25', false);

      expect(text).toContain('✓ *Checklist del cumple*');
      expect(text).toContain('📅 Fecha: 25/12/2026');
      expect(text).toContain('⏰ 30 días antes');
      expect(text).toContain('⬜ Reservar salón');
      expect(text).toContain('⏰ 1 día antes');
      expect(text).toContain('✅ Comprar torta');
      expect(text).toContain('📍 Día del cumple');
      expect(text).toContain('⬜ Decorar');
    });

    it('formats checklist with pending tasks only', () => {
      const tasks = createTasks();
      const text = formatChecklistForWhatsApp(tasks, '2026-12-25', true);

      expect(text).toContain('⬜ Reservar salón');
      expect(text).not.toContain('Comprar torta');
      expect(text).toContain('⬜ Decorar');
    });

    it('handles empty checklist', () => {
      const text = formatChecklistForWhatsApp([], null, false);
      expect(text).toContain('Lista vacía');
    });

    it('handles empty pending checklist', () => {
      const tasks = createTasks().map((task) => ({ ...task, done: true }));
      const text = formatChecklistForWhatsApp(tasks, '2026-12-25', true);
      expect(text).toContain('No hay tareas pendientes');
    });

    it('truncates long checklists', () => {
      const tasks: Task[] = Array.from({ length: 200 }, (_, i) => ({
        id: String(i),
        title: `Tarea ${i} con un título muy largo para ocupar más espacio en el texto`,
        offsetDays: -i,
        done: false,
        fixed: false,
      }));

      const text = formatChecklistForWhatsApp(tasks, '2026-12-25', false);
      expect(text.length).toBeLessThanOrEqual(2000);
      expect(text).toContain('truncada');
    });
  });

  describe('getWhatsAppUrl', () => {
    it('generates valid WhatsApp URL', () => {
      const text = 'Hola mundo';
      const url = getWhatsAppUrl(text);
      
      expect(url).toBe('https://wa.me/?text=Hola%20mundo');
    });

    it('handles special characters', () => {
      const text = 'Lista:\n- Item 1\n- Item 2';
      const url = getWhatsAppUrl(text);
      
      expect(url).toContain('https://wa.me/?text=');
      expect(url).toContain('%0A'); // newline encoded
    });
  });
});
