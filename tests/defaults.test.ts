import { describe, expect, it } from 'vitest';
import { suggestedBudgetLines } from '../src/lib/planner/budget';
import { seedTasks } from '../src/lib/planner/checklist';
import { createPlan } from '../src/lib/planner/createPlan';
import { suggestedShoppingItems } from '../src/lib/planner/shopping';

describe('default starting values', () => {
  describe('suggested budget lines', () => {
    it('returns 8 suggested lines for Argentine parties', () => {
      const lines = suggestedBudgetLines();
      expect(lines).toHaveLength(8);
    });

    it('includes key categories: salón, animación, torta, catering', () => {
      const lines = suggestedBudgetLines();
      const categories = lines.map((line) => line.category);
      expect(categories).toContain('lugar');
      expect(categories).toContain('animacion');
      expect(categories).toContain('torta');
      expect(categories).toContain('comida');
    });

    it('has appropriate units for each category', () => {
      const lines = suggestedBudgetLines();
      const salon = lines.find((line) => line.category === 'lugar');
      const torta = lines.find((line) => line.category === 'torta');
      expect(salon?.unit).toBe('servicio');
      expect(torta?.unit).toBe('kg');
    });
  });

  describe('suggested shopping items', () => {
    it('returns 8 non-food items', () => {
      const items = suggestedShoppingItems(20);
      expect(items).toHaveLength(8);
    });

    it('scales quantities by guest count where appropriate', () => {
      const items10 = suggestedShoppingItems(10);
      const items20 = suggestedShoppingItems(20);
      
      const plates10 = items10.find((item) => item.sourceId === 'suggested:platos');
      const plates20 = items20.find((item) => item.sourceId === 'suggested:platos');
      
      // Plates scale with guests (1.2 per guest)
      expect(plates10?.quantity).toBeLessThan(plates20?.quantity!);
    });

    it('has fixed quantities for non-scalable items', () => {
      const items10 = suggestedShoppingItems(10);
      const items20 = suggestedShoppingItems(20);
      
      const candles10 = items10.find((item) => item.sourceId === 'suggested:velas');
      const candles20 = items20.find((item) => item.sourceId === 'suggested:velas');
      
      // Candles don't scale
      expect(candles10?.quantity).toBe(candles20?.quantity);
    });

    it('includes essential items: plates, cups, napkins, ice, trash bags', () => {
      const items = suggestedShoppingItems(20);
      const names = items.map((item) => item.sourceId);
      expect(names).toContain('suggested:platos');
      expect(names).toContain('suggested:vasos');
      expect(names).toContain('suggested:servilletas');
      expect(names).toContain('suggested:hielo');
      expect(names).toContain('suggested:bolsas');
    });
  });

  describe('checklist tasks', () => {
    it('starts 8-12 weeks before the party', () => {
      const tasks = seedTasks();
      const firstTask = tasks.reduce((earliest, task) => 
        task.offsetDays < earliest.offsetDays ? task : earliest
      );
      
      // Should be around -70 days (10 weeks)
      expect(firstTask.offsetDays).toBeLessThanOrEqual(-56); // At least 8 weeks
      expect(firstTask.offsetDays).toBeGreaterThanOrEqual(-84); // At most 12 weeks
    });

    it('includes key milestones: salón, animación, invitations', () => {
      const tasks = seedTasks();
      const titles = tasks.map((task) => task.title.toLowerCase());
      
      expect(titles.some((title) => title.includes('salón') || title.includes('salon'))).toBe(true);
      expect(titles.some((title) => title.includes('animación') || title.includes('animacion'))).toBe(true);
      expect(titles.some((title) => title.includes('invitaciones'))).toBe(true);
    });

    it('has tasks spread across the timeline', () => {
      const tasks = seedTasks();
      const offsets = tasks.map((task) => task.offsetDays);
      
      // Should have tasks in different time ranges
      const hasEarly = offsets.some((offset) => offset <= -56); // 8+ weeks
      const hasMid = offsets.some((offset) => offset > -56 && offset <= -14); // 2-8 weeks
      const hasLate = offsets.some((offset) => offset > -14 && offset < 0); // Last 2 weeks
      const hasDay = offsets.some((offset) => offset === 0); // Day of
      
      expect(hasEarly).toBe(true);
      expect(hasMid).toBe(true);
      expect(hasLate).toBe(true);
      expect(hasDay).toBe(true);
    });
  });

  describe('createPlan (new plans)', () => {
    it('includes suggested budget lines', () => {
      const plan = createPlan();
      expect(plan.budgetLines.length).toBeGreaterThan(0);
      expect(plan.budgetLines.some((line) => line.category === 'lugar')).toBe(true);
    });

    it('includes suggested shopping items', () => {
      const plan = createPlan();
      expect(plan.shoppingItems.length).toBeGreaterThan(0);
      expect(plan.shoppingItems.some((item) => item.sourceId?.startsWith('suggested:'))).toBe(true);
    });

    it('includes updated checklist tasks', () => {
      const plan = createPlan();
      expect(plan.tasks.length).toBeGreaterThan(20);
      
      // Should start earlier than old default (-28 days)
      const earliestTask = plan.tasks.reduce((earliest, task) => 
        task.offsetDays < earliest.offsetDays ? task : earliest
      );
      expect(earliestTask.offsetDays).toBeLessThan(-28);
    });

    it('budget lines have empty amounts for user to fill', () => {
      const plan = createPlan();
      expect(plan.budgetLines.every((line) => line.unitPriceCentavos === null)).toBe(true);
      expect(plan.budgetLines.every((line) => line.contractedCentavos === null)).toBe(true);
    });

    it('shopping items are not bought yet', () => {
      const plan = createPlan();
      expect(plan.shoppingItems.every((item) => !item.bought)).toBe(true);
      expect(plan.shoppingItems.every((item) => item.purchasedQuantity === 0)).toBe(true);
    });
  });
});
