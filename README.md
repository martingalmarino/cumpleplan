# Festejito

Planificador estático para cumpleaños infantiles en Argentina. El plan se guarda en el navegador. El directorio inicial es de Córdoba Capital y solo publica fichas con datos revisados.

El sitio es festejito.com.ar.

## Requisitos

Node.js 22 o superior.

## Comandos

```bash
npm install
npm run dev
npm test
npm run check
npm run build
npm run preview
```

`npm run dev` abre el sitio local. `npm run build` genera `dist/` para un hosting estático. `npm test` corre las pruebas de cálculo, presupuesto, compras, fechas, validación del plan guardado y proveedores.

## Dominio e indexación

Copiá `.env.example` a `.env`.

- `PUBLIC_SITE_URL`: origen real, por ejemplo `https://www.tudominio.com`, sin barra final. Si está vacío, no se inventa un dominio canónico.
- `PUBLIC_ALLOW_INDEXING=true` solo cuando ese origen sea el de producción.

Si falta el origen o la variable no es exactamente `true`, las páginas salen con `noindex`. El mapa del sitio queda vacío en ese caso. `/organizador/` no se indexa nunca y no entra al mapa.

En Vercel u otro hosting estático: comando de build `npm run build`, directorio de salida `dist`. Cargá las mismas variables en el panel y volvé a construir. No actives la indexación en un dominio de preview.

## Coeficientes y contenido

Los supuestos de comida y bebida están en `src/config/calculator.ts`. Las páginas y las pruebas usan esas funciones, así que un cambio de coeficiente tiene que seguir siendo explícito en los textos si el ejemplo publicado deja de coincidir.

Las guías viven en `src/content/guias/`. El esquema está en `src/content.config.ts`.

## Proveedores

Las fichas están en `src/data/providers/records.ts`. Solo se publican las que tienen `publicationStatus: "published"`. Hace falta nombre, ciudad, dirección o zona y al menos un canal de contacto visto en el sitio o en una red oficial del negocio, más la fecha de revisión y la fuente de cada dato. Cada sede va en su propia ficha; las de una misma marca comparten `brandGroup` y se muestran primero entre los relacionados. WhatsApp solo aparece si el negocio lo publica como tal; si el único canal es una red, el botón dice “Consultar en Facebook”. `mapUrl` es una búsqueda de la dirección (“Buscar dirección en el mapa”), nunca un pin con coordenadas. En `sources`, `type` y `accessMethod` son metadatos internos y no se muestran; `reviewedAt` solo hace falta si esa fuente se revisó en otra fecha que la ficha. Cada ficha necesita `summary` (una oración, hasta 120 caracteres), `description` (el texto de “Sobre…”) y `highlights` (hasta 3 datos cortos para la tarjeta). Los campos opcionales (`services`, `addOns`, `coverage`, `capacity`, `ageRange`, `spaces`, `duration`, `openingHours`, `leadTime`, `delivery`, `bookingNote`, `images`) se completan solo si el proveedor los publica en su sitio oficial, y esa fuente se anota en `sources[].fields`. Si no están, la ficha no los muestra. `images` es solo para fotos reales con permiso y crédito. Nunca se cargan precios, puntajes ni reseñas. `featured` queda en `false`.

Los filtros, conteos, textos por rubro y datos clave salen de `src/data/providers/selectors.ts`. Los conteos de los botones de rubro son fijos sobre todas las fichas publicadas; el total de resultados es el que cambia con la búsqueda y con “Con WhatsApp”. Las URL con filtros (`?rubro=`, `?q=`, `?whatsapp=1`) no van al sitemap.

Si no hay fichas publicadas, el directorio sale del menú, la ruta explica que está vacío y lleva `noindex`.

## Plan en el navegador

La clave es `cumple-en-orden:plan:v1`. No hay cuenta ni sincronización. Borrar los datos del navegador borra el plan. No hay exportación ni importación visible: se sacó porque un archivo JSON no se entiende para el público del sitio. El validador de `src/lib/planner/schema.ts` sigue protegiendo lo que se lee del navegador: un plan guardado de una versión futura, uno dañado o uno con campos no permitidos no se pisa en silencio.

## Publicidad y analítica

Siguen apagadas. Completar `PUBLIC_ADSENSE_CLIENT`, `PUBLIC_ADSENSE_SLOT` o `PUBLIC_ANALYTICS_ID` no las enciende: en `src/config/site.ts`, `consentImplemented` está en `false` hasta que exista un consentimiento real. No hay `ads.txt` porque no hay un identificador de editor para publicar.

Los lugares previstos para anuncios están debajo de las explicaciones y entre la guía y los enlaces, nunca dentro del formulario ni en el plan personal ni en la impresión.
