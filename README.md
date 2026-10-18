# CurseStone.readthedocs.io

Main docs site of CurseStone

Official documentation for [CurseStone](https://github.com/CurseStoneTeam/CurseStone), built with [Sphinx](https://www.sphinx-doc.org/) and the [Shibuya](https://shibuya.lepture.com/) theme, published on Read the Docs.

## Structure

```
.readthedocs.yml        Read the Docs configuration
docs/
├── conf.py             Sphinx configuration
├── requirements.txt    build dependencies
├── index.md            bilingual (ESP/ENG) landing page and menu
├── _static/
│   ├── custom.css      graphite theme, glass header and landing page styles
│   └── custom.js       landing page language switch
├── installation.md     installation guide (EN)
├── installation-es.md  installation guide (ES)
├── plugins/            Lua plugin guide, one page per topic (EN + ES)
│   ├── index.md            getting started, manifest, lifecycle, modules (EN)
│   ├── commands.md         commands and permissions (EN)
│   ├── events.md           events reference (EN)
│   ├── scheduler.md        scheduled tasks (EN)
│   ├── data.md             data, config and resources (EN)
│   ├── worlds.md           world API (EN)
│   ├── players.md          player API and handles (EN)
│   ├── api-reference.md    full API reference (EN)
│   ├── best-practices.md   limits and troubleshooting (EN)
│   └── *-es.md             Spanish mirror of every page
├── example-plugin.md   example plugin page
└── _examples/          example plugin source code
```

## Building locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r docs/requirements.txt
sphinx-build -b html docs docs/_build/html
```

Open `docs/_build/html/index.html` in your browser.

## Appearance

The docs use Shibuya with a custom theme in `docs/_static/custom.css`, matching the CurseStone
website: graphite background, white text, a glass-effect header, Inter and JetBrains Mono
typefaces, bordered tables and code blocks, and black and white admonitions. Every selector
starts with `:root:root` so it overrides the theme's own styles, and the light/dark mode switch
is hidden because the page is always graphite.

The landing page (`index.md`) is plain HTML inside a `{raw} html` block, with ESP and ENG texts
that are toggled by the language button (`custom.js` saves the choice in `localStorage`). Its
links point to `.html` files, so they work with Sphinx's `html` builder (the Read the Docs
default); if you switch to `dirhtml`, update those links.

## Publishing on Read the Docs

1. Push this repository to GitHub.
2. Go to https://app.readthedocs.org, sign in with GitHub and choose **Import a Project**.
3. Select the repository. Read the Docs detects `.readthedocs.yml` and builds on every push.

## Adding a page

1. Create `docs/my-page.md` with a `# ...` title.
2. Add it to the `toctree` list in `docs/index.md`.
