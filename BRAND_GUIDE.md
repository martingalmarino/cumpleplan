# Guía de marca — Festejito

Concepto: “La alegría del cumple, con todo en su lugar.”

La marca habla con adultos que organizan un cumpleaños infantil en Argentina. El tono es alegre, práctico y cercano, en voseo. El sitio es festejito.com.ar. El isotipo es una F blanca sobre un cuadrado verde `#237A32`, con una llama amarilla al final del trazo de arriba: la inicial del nombre convertida en vela. En una sola tinta, la F y la llama van blancas sobre azul marino. El nombre va escrito como texto, nunca como imagen.

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

No se usan fotos genéricas de fiesta ni fotos de los proveedores. En el directorio, cada rubro tiene un ícono de trazo dentro de un cuadrado de color (`CategoryIcon`): salones en celeste con casa, animación en manteca con destellos, tortas y catering en durazno con torta, decoración en menta con globo. El aviso de transparencia aclara que esos íconos son genéricos.

## Componentes

Clases en `src/styles/global.css`, `src/styles/planner.css` y `src/styles/directory.css`.

- Botón primario: `button button-primary`. Fondo `#237A32`, texto blanco.
- Botón secundario: `button button-secondary`.
- Botón quieto: `button-quiet`. Destructivo: `button-danger`.
- Cabecera: `.site-header`, `.desktop-nav`, `.tools-menu`, `.mobile-panel`.
- Inicio: `.hero`, `.paper-label`, `.quick-strip`, `.tool-board`, `.sequence`, `.guide-row`, `.provider-band`, `.band`.
- Herramientas: `.tool-nav`, `.planner-main.tool-comida`, `.tool-presupuesto`, `.tool-checklist`, `.tool-compras`.
- Lectura: `.prose`, `.callout`, `.crumbs`.
- Impresión: `src/styles/print.css`, sin rellenos decorativos y con Nunito.

El menú de herramientas y el menú móvil se abren con un script chico en `Header.astro`. Escape cierra y devuelve el foco. La página de marketing no monta React para el menú.

## Directorio de proveedores

Los componentes viven en `src/components/directory/`.

- Fila (`ProviderRow`, `.provider-row`): formato clásico de guía comercial. A la izquierda, el ícono del rubro, el rubro en verde, el nombre enlazado a la ficha y el barrio. En el centro, el resumen de una línea, la dirección o la cobertura y hasta tres servicios como etiquetas (`.tag-list`). A la derecha, el contacto principal como botón primario (WhatsApp; si no hay, el teléfono), el sitio oficial y “Ver ficha”. Abajo, la fecha de revisión. Bajo 1024 px las acciones bajan a una fila; bajo 760 px todo va en una columna y el botón ocupa el ancho.
- Listado (`DirectoryBrowser`): accesos por rubro con conteo (`.category-shortcuts`), buscador por nombre, barrio o servicio, rubro, casilla “Con WhatsApp”, encabezado “N proveedores · orden alfabético” y “Limpiar filtros”. El orden es siempre alfabético. El rubro elegido queda en la URL como `?rubro=`.
- Contacto (`ContactActions`): orden fijo WhatsApp, llamar, sitio oficial, Instagram y mapa. El primero es botón primario y el resto secundario, todos de al menos 44 px. Cada enlace a un contacto lleva `data-analytics="provider_contact_clicked"` y `data-provider-id`; el mapa no se mide.
- Ficha: dos columnas. A la derecha, el contacto queda fijo al hacer scroll; en el celular va primero. La columna principal tiene “Sobre el lugar”, “Datos clave” (`.key-facts`), preguntas para el presupuesto, “Anotalo en tu plan”, fuentes y, al final, “Otros proveedores” del mismo rubro.

Regla de datos: un campo aparece solo si el proveedor lo publica en su sitio oficial, y la fuente queda anotada. Si falta, la ficha no lo muestra ni lo reemplaza con un texto de relleno. No hay precios, puntajes, reseñas ni fotos.
