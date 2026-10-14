# CurseStone.readthedocs.io

Web docs principal of CurseStone

Documentación oficial de [CurseStone](https://github.com/CurseStoneTeam/CurseStone), construida con [Sphinx](https://www.sphinx-doc.org/) y el tema [Shibuya](https://shibuya.lepture.com/), publicada en Read the Docs.

## Estructura

```
.readthedocs.yml        configuración de Read the Docs
docs/
├── conf.py             configuración de Sphinx
├── requirements.txt    dependencias para compilar
├── index.md            portada y menú
├── installation.md     guía de instalación (EN)
├── installation-es.md  guía de instalación (ES)
├── plugins.md          guía de plugins Lua (EN)
├── plugins-es.md       guía de plugins Lua (ES)
├── example-plugin.md   página del plugin de ejemplo
└── _examples/          código del plugin de ejemplo
```

## Compilar en local

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r docs/requirements.txt
sphinx-build -b html docs docs/_build/html
```

Abre `docs/_build/html/index.html` en el navegador.

## Publicar en Read the Docs

1. Sube este repositorio a GitHub.
2. En https://app.readthedocs.org entra con GitHub y elige **Import a Project**.
3. Selecciona el repositorio. Read the Docs detecta `.readthedocs.yml` y compila solo en cada push.

## Añadir una página

1. Crea `docs/mi-pagina.md` con un título `# ...`.
2. Añádela a la lista `toctree` de `docs/index.md`.
