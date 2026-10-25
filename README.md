# CurseStone Docs (sitio estático)

Documentación de CurseStone como sitio independiente en HTML, CSS y JS puro, con el estilo de cursestone-site.
Sin build, sin dependencias y sin módulos ES: **abre `index.html`** o súbelo tal cual a GitHub Pages, Cloudflare Pages, Netlify, etc.

```
index.html              página única (enrutado por hash: #/installation, #/plugins/events?ancla)
css/                    base, layout y components (de cursestone-site) + docs.css
js/app.js               rutas, menú, buscador, tema y cambio ESP/ENG
js/config.js            textos de la interfaz y estructura del menú
js/markdown.js          renderizador de Markdown (tablas, listas, avisos, código)
js/highlight.js         resaltado de Lua, YAML, Bash e INI
js/data/docs.js         contenido de las guías (generado)
build-docs.py           regenera js/data/docs.js desde los .md de docs-main
```

## Actualizar el contenido

Edita los `.md` de `docs-main/docs` y ejecuta:

```bash
python3 build-docs.py ruta/a/docs-main/docs
```

Para añadir una página nueva, añádela también a `NAV` en `js/config.js` (y a `MIRROR` si tiene versión en el otro idioma).

Las fuentes (Google Fonts) y los iconos (Font Awesome) se cargan desde CDN, igual que en cursestone-site.
