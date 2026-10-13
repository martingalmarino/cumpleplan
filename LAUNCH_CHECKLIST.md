# Antes de publicar

## Ya funciona en el sitio

- Calculadora de comida y bebida con supuestos editables y el ejemplo de 20 chicos y 10 adultos.
- Presupuesto en pesos, comparación de hasta tres alternativas y seña como pago.
- Checklist con fechas de calendario en Argentina.
- Lista de compras vinculada al cálculo y al presupuesto.
- Un plan por navegador, con exportación e importación JSON.
- Impresión desde el cuadro del navegador.
- Guías y páginas legales que describen este comportamiento.
- Directorio con fichas revisadas el 13 de octubre de 2026. No cubre la meta de 20 a 30 proveedores.

## Falta fuera del código

- Dominio real en `PUBLIC_SITE_URL` y, solo entonces, `PUBLIC_ALLOW_INDEXING=true`.
- Correo real en `PUBLIC_CONTACT_EMAIL`. Hoy el contacto dice que no está habilitado.
- Nombre o razón social de quien opera el sitio, en privacidad y términos, y una lectura legal de esos textos.
- Seguir relevando proveedores de Córdoba Capital en sus sitios oficiales hasta decidir si el directorio queda corto o se amplía. No completar fichas de memoria.
- Si se quiere publicidad: identificadores reales, `ads.txt` armado con esos datos y un consentimiento válido. Recién ahí se puede pasar `consentImplemented` a `true`.
- Imagen social en PNG si la red que uses no acepta el SVG de `public/og.svg`.
