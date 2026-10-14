# Configuration file for the Sphinx documentation builder.
# https://www.sphinx-doc.org/en/master/usage/configuration.html

project = "CurseStone"
author = "CurseStone Team"
copyright = "2026, CurseStone Team"

extensions = [
    "myst_parser",
    "sphinx_copybutton",
]

# Markdown (MyST)
source_suffix = {".md": "markdown"}
master_doc = "index"
myst_enable_extensions = ["colon_fence"]
myst_heading_anchors = 3

# Los plugins de ejemplo se incluyen con literalinclude, no son páginas
exclude_patterns = ["_build", "_examples", "Thumbs.db", ".DS_Store"]

# Bloques de código sin lenguaje: texto plano
highlight_language = "text"

# Tema Shibuya
html_theme = "shibuya"
html_title = "CurseStone"
html_theme_options = {
    "accent_color": "gray",
    "github_url": "https://github.com/CurseStoneTeam/CurseStone",
    "discord_url": "https://discord.gg/h6TXynYC8p",
    "globaltoc_expand_depth": 1,
    "nav_links": [
        {
            "title": "Releases",
            "url": "https://github.com/CurseStoneTeam/CurseStone/releases",
        },
        {
            "title": "Code reference",
            "url": "https://CurseStoneTeam.github.io/",
        },
    ],
}

# Apariencia propia: tema grafito, tipografías y portada bilingüe
html_static_path = ["_static"]
html_css_files = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800"
    "&family=JetBrains+Mono:wght@400;600&display=swap",
    "custom.css",
]
html_js_files = ["custom.js"]
