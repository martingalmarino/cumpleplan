import { describe, expect, it } from 'vitest';
import { getDirectoryUrl, budgetCategoryToRubro, taskTitleToRubro } from '../src/lib/directory';

describe('directory utilities', () => {
  describe('getDirectoryUrl', () => {
    it('returns national index when no rubro is provided', () => {
      expect(getDirectoryUrl(null)).toBe('/directorio/');
      expect(getDirectoryUrl(null, 'Córdoba')).toBe('/directorio/');
    });

    it('returns valid province + rubro path when it exists', () => {
      // Córdoba tiene proveedores de salones
      const url = getDirectoryUrl('salones', 'Córdoba');
      expect(url).toBe('/directorio/cordoba/salones-infantiles/');
    });

    it('falls back to province index when rubro does not exist', () => {
      // Córdoba no tiene proveedores de animación publicados
      const url = getDirectoryUrl('animacion', 'Córdoba');
      // Debería hacer fallback a /directorio/cordoba/
      expect(url).toBe('/directorio/cordoba/');
    });

    it('falls back to national index when province does not exist', () => {
      // Salta no tiene proveedores
      const url = getDirectoryUrl('salones', 'Salta');
      expect(url).toBe('/directorio/');
    });

    it('falls back to national index when neither province nor rubro exist', () => {
      // Provincia inexistente y rubro sin proveedores
      const url = getDirectoryUrl('animacion', 'Salta');
      expect(url).toBe('/directorio/');
    });

    it('handles tortas-catering correctly', () => {
      // Verificar que tortas-catering funciona (si hay proveedores)
      const url = getDirectoryUrl('tortas-catering', 'Córdoba');
      // Puede ser el path específico o fallback a provincia
      expect(url).toMatch(/^\/directorio\/(cordoba\/tortas-y-catering\/|cordoba\/|\/)$/);
    });
  });

  describe('budgetCategoryToRubro', () => {
    it('maps budget categories to directory rubros', () => {
      expect(budgetCategoryToRubro('lugar')).toBe('salones');
      expect(budgetCategoryToRubro('comida')).toBe('tortas-catering');
      expect(budgetCategoryToRubro('bebidas')).toBe('tortas-catering');
      expect(budgetCategoryToRubro('torta')).toBe('tortas-catering');
      expect(budgetCategoryToRubro('decoracion')).toBe('decoracion');
      expect(budgetCategoryToRubro('animacion')).toBe('animacion');
    });

    it('returns null for unmapped categories', () => {
      expect(budgetCategoryToRubro('souvenirs')).toBeNull();
      expect(budgetCategoryToRubro('descartables')).toBeNull();
      expect(budgetCategoryToRubro('otros')).toBeNull();
    });
  });

  describe('taskTitleToRubro', () => {
    it('detects salon-related keywords', () => {
      expect(taskTitleToRubro('Reservar salón')).toBe('salones');
      expect(taskTitleToRubro('Confirmar salon')).toBe('salones');
      expect(taskTitleToRubro('Buscar lugar para el cumple')).toBe('salones');
      expect(taskTitleToRubro('Reservar espacio')).toBe('salones');
    });

    it('detects catering-related keywords', () => {
      expect(taskTitleToRubro('Encargar torta')).toBe('tortas-catering');
      expect(taskTitleToRubro('Contratar catering')).toBe('tortas-catering');
      expect(taskTitleToRubro('Pedir comida')).toBe('tortas-catering');
    });

    it('detects animation-related keywords', () => {
      expect(taskTitleToRubro('Contratar animación')).toBe('animacion');
      expect(taskTitleToRubro('Llamar al animador')).toBe('animacion');
      expect(taskTitleToRubro('Confirmar animacion')).toBe('animacion');
    });

    it('detects decoration-related keywords', () => {
      expect(taskTitleToRubro('Comprar decoración')).toBe('decoracion');
      expect(taskTitleToRubro('Encargar globos')).toBe('decoracion');
      expect(taskTitleToRubro('Comprar decoracion')).toBe('decoracion');
    });

    it('returns null for unrelated task titles', () => {
      expect(taskTitleToRubro('Mandar invitaciones')).toBeNull();
      expect(taskTitleToRubro('Comprar regalos')).toBeNull();
      expect(taskTitleToRubro('Confirmar asistentes')).toBeNull();
    });

    it('handles mixed case and accents', () => {
      expect(taskTitleToRubro('RESERVAR SALÓN')).toBe('salones');
      expect(taskTitleToRubro('Encargar Torta')).toBe('tortas-catering');
    });
  });
});
