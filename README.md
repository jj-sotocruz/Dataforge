# DataForge Analytics — sitio web (HTML5 + CSS3 + Bootstrap 5.3 + JavaScript)

Abrir `index.html` con un servidor local (por ejemplo `python -m http.server`) o publicarlo como sitio estático.

## Estructura
- `index.html`, `contacto.html`, `portal.html`, `mapa_sitio.html` (raíz) y carpetas `servicios/`, `casos_exito/`, `nosotros/`, `clientes/`, `blog/`
- `css/` → `vendor/` (Bootstrap 5.3.3 y Bootstrap Icons), `estilos.css` (personalización global) y una hoja por página
- `js/` → `vendor/` (Bootstrap bundle y Chart.js), `app.js`, `contacto.js`, `portal.js`
- `imagenes/` → una subcarpeta por página (logo e íconos SVG, imágenes WebP, video con subtítulos)

## Portal del cliente (demostración)
Cuentas: `cliente@verdeluz.pe`, `cliente@finova.pe`, `cliente@bienestar.pe` · Contraseña: `DataForge2026`.
Los datos son ficticios y se guardan solo en el navegador (localStorage). Para producción, conectar contacto y portal a un servidor.
