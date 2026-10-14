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

Las fichas están en `src/data/providers/records.ts`. Solo se publican las que tienen `publicationStatus: "published"`. Hace falta sitio oficial, ciudad, servicio y al menos un contacto público, más la fecha de revisión y la fuente de cada dato. Los campos opcionales (`summary`, `services`, `coverage`, `capacity`, `ageRange`, `openingHours`, `bookingNote`) se completan solo si el proveedor los publica en su sitio oficial, y esa fuente se anota en `sources[].fields`. Si no están, la ficha no los muestra. Nunca se cargan precios, puntajes ni reseñas. `featured` queda en `false`.

Si no hay fichas publicadas, el directorio sale del menú, la ruta explica que está vacío y lleva `noindex`.

## Plan en el navegador

La clave es `cumple-en-orden:plan:v1`. No hay cuenta ni sincronización. Borrar los datos del navegador borra el plan. No hay exportación ni importación visible: se sacó porque un archivo JSON no se entiende para el público del sitio. El validador de `src/lib/planner/schema.ts` sigue protegiendo lo que se lee del navegador: un plan guardado de una versión futura, uno dañado o uno con campos no permitidos no se pisa en silencio.

## Publicidad y analítica

Siguen apagadas. Completar `PUBLIC_ADSENSE_CLIENT`, `PUBLIC_ADSENSE_SLOT` o `PUBLIC_ANALYTICS_ID` no las enciende: en `src/config/site.ts`, `consentImplemented` está en `false` hasta que exista un consentimiento real. No hay `ads.txt` porque no hay un identificador de editor para publicar.

Los lugares previstos para anuncios están debajo de las explicaciones y entre la guía y los enlaces, nunca dentro del formulario ni en el plan personal ni en la impresión.
