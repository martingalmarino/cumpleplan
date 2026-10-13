# Guía de marca — Cumple en Orden

Concepto: “La alegría del cumple, con todo en su lugar.”

La marca habla con adultos que organizan un cumpleaños infantil en Argentina. El tono es alegre, práctico y cercano, en voseo. El símbolo es un tilde con confeti: orden más festejo. No es un logo de imagen ni un set de emojis.

## Color

Los tokens viven en `src/styles/tokens.css`.

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-ink` | `#17324D` | Texto principal y texto sobre amarillo o naranja |
| `--color-muted` | `#526477` | Texto secundario |
| `--color-paper` | `#FFFDF7` | Fondo de página |
| `--color-surface` | `#FFFFFF` | Tarjetas y cabecera |
| `--color-border` | `#DCE3E8` | Bordes |
| `--color-green` | `#339933` | Acento de comida |
| `--color-green-action` | `#237A32` | Botón primario, texto blanco |
| `--color-green-hover` | `#195D26` | Hover del botón primario |
| `--color-orange` | `#FF6633` | Acento de presupuesto |
| `--color-blue` | `#3366CC` | Acento de checklist |
| `--color-blue-link` | `#244FA8` | Enlaces y navegación activa de herramientas |
| `--color-yellow` | `#FFCC33` | Acento de compras |
| `--color-mint` | `#EDF7EA` | Fondo de comida |
| `--color-peach` | `#FFF0E8` | Fondo de presupuesto |
| `--color-sky` | `#EDF3FF` | Fondo de checklist |
| `--color-butter` | `#FFF7D9` | Fondo de compras |

Una sección usa un acento dominante. Un componente chico puede sumar hasta dos acentos de apoyo. El color va junto a una etiqueta o un ícono. El texto sobre amarillo y naranja es azul marino. Los botones primarios llevan texto blanco en cualquier contexto, también dentro de la navegación.

## Tipografía

- Fredoka 500 y 600, solo para el wordmark y títulos cortos de marketing.
- Nunito Sans 400, 600 y 700 para cuerpo, formularios, navegación, artículos y números.
- Los archivos son locales, subconjunto latino, con `font-display: swap`.
- Los importes usan cifras tabulares.

## Gráfica

El símbolo, el favicon y las ilustraciones son SVG propios en `public/favicon.svg`, `public/og.svg` y `src/components/art/Artwork.astro`.

Familia de dibujos: porción de torta, botella y vaso, bolsa, checklist, recibo, mesa del héroe y la página 404. El héroe puede llevar una etiqueta de papel inclinada con sombra corrida. El patrón decorativo no va sobre texto, botones ni campos.

No se usan fotos genéricas de fiesta ni fotos de los proveedores. Las tarjetas del directorio dicen que la ilustración no es una foto del lugar.

## Componentes

Clases en `src/styles/global.css` y `src/styles/planner.css`.

- Botón primario: `button button-primary`. Fondo `#237A32`, texto blanco.
- Botón secundario: `button button-secondary`.
- Botón quieto: `button-quiet`. Destructivo: `button-danger`.
- Cabecera: `.site-header`, `.desktop-nav`, `.tools-menu`, `.mobile-panel`.
- Inicio: `.hero`, `.paper-label`, `.quick-strip`, `.tool-board`, `.sequence`, `.guide-row`, `.provider-band`, `.band`.
- Herramientas: `.tool-nav`, `.planner-main.tool-comida`, `.tool-presupuesto`, `.tool-checklist`, `.tool-compras`.
- Lectura: `.prose`, `.callout`, `.crumbs`.
- Impresión: `src/styles/print.css`, sin rellenos decorativos y con Nunito.

El menú de herramientas y el menú móvil se abren con un script chico en `Header.astro`. Escape cierra y devuelve el foco. La página de marketing no monta React para el menú.
