# Propuesta de Diseño: Fichas de Proveedores Estilo Yelp

## Resumen Ejecutivo

Propuesta de rediseño de las fichas individuales de proveedores (`/proveedor/{slug}/`) y páginas de categoría del directorio, inspirado en Yelp pero adaptado a la identidad visual de Festejito y los datos disponibles.

## Campos de Datos Disponibles

### ✅ Datos actuales en `ProviderRecord`

**Identificación:**
- `id`, `slug`, `name`
- `categories[]` (múltiples categorías)
- `brandGroup` (para relacionar sedes)

**Ubicación:**
- `city`, `province`, `country`, `locality`
- `neighborhood`, `address`, `postalCode`
- `mapUrl` (búsqueda Google Maps)
- `coverage` (alcance de servicios)

**Descripción:**
- `summary` (una línea para tarjetas)
- `description` (texto "Sobre...")
- `highlights[]` (hasta 3 datos cortos)
- `services[]`, `addOns[]`

**Datos operacionales:**
- `capacity`, `ageRange`, `spaces`
- `duration`, `openingHours`, `leadTime`
- `delivery`, `bookingNote`

**Contacto:**
- `website`, `socialUrl`, `email`
- `phoneDisplay`, `phoneTel`
- `secondaryPhoneDisplay`, `secondaryPhoneTel`
- `whatsappUrl`

**Contenido visual:**
- `images[]` (con src, dimensions, alt, credit)

**Metadatos:**
- `sources[]` (fuentes de verificación)
- `verifiedAt`, `publicationStatus`, `featured`
- `quoteQuestions[]` (preguntas sugeridas)

## 🆕 Campos Nuevos Propuestos (requieren nueva data)

### Críticos para experiencia tipo Yelp

1. **`rating: number`** (1-5)
   - Calificación promedio del proveedor
   - Requiere: sistema de reseñas

2. **`reviewCount: number`**
   - Cantidad de reseñas recibidas
   - Requiere: sistema de reseñas

3. **`reviews: Review[]`**
   ```typescript
   type Review = {
     id: string;
     author: string;
     rating: number; // 1-5
     date: IsoDate;
     text: string;
     helpful: number; // votos útiles
     eventType?: 'birthday' | 'baby_shower' | 'baptism' | 'other';
     ageGroup?: string; // ej: "5 años"
   }
   ```
   - Requiere: sistema de reseñas + moderación

4. **`priceRange: string`**
   - Ej: "$", "$$", "$$$", "$$$$" o "Desde $50.000"
   - Requiere: investigación de mercado + actualización periódica

5. **`responseTime?: string`**
   - Ej: "Responde en menos de 1 hora", "Responde en el día"
   - Requiere: tracking de respuestas o dato declarado

6. **`responseRate?: number`**
   - Porcentaje de consultas respondidas
   - Requiere: tracking de respuestas

### Deseables (mejoran la experiencia)

7. **`certifications?: string[]`**
   - Ej: ["Habilitación municipal", "Bomberos", "Seguro RC"]
   - Requiere: verificación de documentos

8. **`amenities?: string[]`**
   - Ej: ["WiFi", "Estacionamiento", "Acceso wheelchair", "Aire acondicionado"]
   - Algunos ya están en `services`, pero más estructurados

9. **`gallery: GalleryImage[]`**
   - Similar a `images` pero con categorías
   ```typescript
   type GalleryImage = {
     src: string;
     width: number;
     height: number;
     alt: string;
     credit: string;
     category: 'interior' | 'games' | 'events' | 'food' | 'exterior';
   }
   ```
   - Requiere: más fotos categorizadas

10. **`videoUrl?: string`**
    - Video del espacio o servicios
    - Requiere: contenido de video

11. **`faq?: FAQ[]`**
    ```typescript
    type FAQ = {
      question: string;
      answer: string;
    }
    ```
    - Más estructurado que `quoteQuestions`
    - Requiere: FAQs del proveedor

12. **`awards?: string[]`**
    - Reconocimientos o premios
    - Requiere: verificación

13. **`seasonalHours?: SeasonalHours`**
    - Horarios especiales (verano, invierno, feriados)
    - Requiere: datos más detallados que `openingHours`

14. **`cancellationPolicy?: string`**
    - Política de cancelación y reprogramación
    - Requiere: dato del proveedor

15. **`minimumAdvance?: string`**
    - Anticipación mínima para reservar
    - Parcialmente cubierto por `leadTime`

## Estrategia de Implementación

### Fase 1: Rediseño con datos actuales
- Hero con galería de imágenes
- Panel de contacto mejorado (CTAs prominentes)
- Facts cards visuales
- Mapa interactivo
- Servicios en grilla
- Related providers mejorado

### Fase 2: Sistema de reseñas (futuro)
- `rating`, `reviewCount`, `reviews[]`
- Formulario de reseña
- Filtros y ordenamiento de reseñas
- Trust badges basados en reseñas

### Fase 3: Datos de negocio (futuro)
- `priceRange`
- `responseTime`, `responseRate`
- `certifications`, `awards`

### Fase 4: Contenido enriquecido (futuro)
- `gallery` categorizado
- `videoUrl`
- `faq` estructurado
- `amenities` detallados

## Archivos en esta Propuesta

- `ficha-salon-desktop.html` - Mockup desktop de ficha de salón (datos ricos)
- `ficha-salon-mobile.html` - Mockup mobile de ficha de salón
- `ficha-minima-desktop.html` - Mockup desktop con datos mínimos (caso real)
- `categoria-desktop.html` - Página de categoría/listado mejorada
- `categoria-mobile.html` - Página de categoría mobile

## Principios de Diseño

1. **Mobile-first**: diseño responsivo desde el inicio
2. **CTAs prominentes**: WhatsApp, teléfono, web siempre visibles
3. **Escaneable**: información en bloques claros
4. **Trust signals**: verificación, fuentes, actualización reciente
5. **Visual**: uso de iconos, fotos, mapas
6. **Accesible**: contraste, tamaños, aria-labels
7. **Brand coherence**: colores, tipografía, íconos de Festejito
