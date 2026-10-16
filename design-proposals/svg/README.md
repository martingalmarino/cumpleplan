# Auditoría de SVG — Festejito

## Propuesta de Diseño de Ilustraciones e Íconos

Este directorio contiene la auditoría completa del sistema de íconos SVG del sitio Festejito, incluyendo:

### 📁 Contenido

- **`index.html`** — Documento de comparación detallado (antiguo vs. mejorado)
- **`icons-improved.svg`** — Colección completa de los 31 íconos mejorados con documentación
- **`favicon-improved.svg`** — Logo optimizado para favicon y OG image
- **`/opt/cursor/artifacts/svg-audit-festejito.png`** — Screenshot del documento de comparación

### 🎯 Resumen de Problemas Identificados

#### Críticos
- **Stroke weight inconsistente**: 1.75px (no estándar) → 2px
- **balloon**: Diseño confuso, nudo y cuerda incomprensibles
- **cake**: Proporciones aplastadas, sin base visual clara

#### Importantes
- **utensils**: Diseño confuso, paths redundantes
- **wallet**: Parece caja genérica, no billetera
- **bag**: Geometría débil, falta apertura
- **users, map, message**: Deberían usar elementos primitivos (circle)
- **phone**: Path innecesariamente complejo

#### Menores
- Falta de bordes redondeados en rectángulos
- Decimales innecesarios en paths (11.5, 6.5, etc.)
- Desalineación de grilla
- Proporción subóptima del espacio 24×24

### ✅ Mejoras Aplicadas

1. **Sistema unificado**
   - Stroke width: 2px estándar (2.5px solo para "check")
   - ViewBox: 24×24 consistente
   - Linecap/linejoin: round
   - Border radius: rx="2" en todos los rectángulos

2. **Geometría optimizada**
   - Uso de elementos primitivos (`<circle>`, `<rect>`)
   - Paths simplificados
   - Alineación a grilla entera
   - Mejor proporción y uso del espacio

3. **Estilo coherente**
   - Diseño cálido y profesional
   - Consistente con la paleta de marca (#237A32, #FFCC33, #17324D)
   - Mejor legibilidad a tamaños pequeños (16px-48px)

### 🔧 Implementación Recomendada

#### 1. Actualizar `src/components/icons/Icon.tsx`

Reemplazar el objeto `paths` con los nuevos paths del archivo `icons-improved.svg`.

Cambiar:
```tsx
strokeWidth="1.75"
```

Por:
```tsx
strokeWidth="2"
strokeLinejoin="round"
```

#### 2. Actualizar logos

- Reemplazar `public/favicon.svg` con `favicon-improved.svg`
- Actualizar `public/og.svg` con la versión mejorada del logo

#### 3. Testing

- [ ] Probar en todos los tamaños (16px, 20px, 24px, 48px)
- [ ] Verificar en todos los navegadores
- [ ] Validar accesibilidad con lectores de pantalla
- [ ] Revisar en modo oscuro/claro (si aplica)

### 📊 Especificaciones Técnicas

| Propiedad | Valor |
|-----------|-------|
| ViewBox | 0 0 24 24 |
| Stroke Width | 2px (check: 2.5px) |
| Stroke Linecap | round |
| Stroke Linejoin | round |
| Fill | none |
| Border Radius | rx="2" |
| Grilla | Valores enteros |
| Color | currentColor |

### 🎨 Paleta de Marca

- Verde Principal: `#237A32`
- Amarillo: `#FFCC33`
- Tinta: `#17324D`
- Papel: `#FFFDF7`
- Menta: `#EDF7EA`
- Naranja: `#FF6633`

---

**Nota**: Esta es una PROPUESTA. No se modificaron archivos del código principal. Todos los cambios están contenidos en esta carpeta `design-proposals/svg/` en la rama `cursor/svg-design-audit-47db`.
