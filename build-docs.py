#!/usr/bin/env python3
"""Genera js/data/docs.js a partir de los .md de docs-main (Sphinx).

Uso:  python3 build-docs.py ruta/a/docs-main/docs
Solo hace falta si cambias los .md; el sitio ya incluye docs.js generado.
"""
import json, re, sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else "docs-main/docs")
out = Path(__file__).parent / "js" / "data" / "docs.js"

TOCTREE = re.compile(r"```\{toctree\}(.*?)```\n?", re.S)
INCLUDE = re.compile(r"```\{literalinclude\}\s+(\S+)\s*\n:language:\s*(\w+)\s*\n```", re.S)

pages = {}


def toctree(m):
    """Convierte un toctree de Sphinx en una lista de enlaces (se omite 'self')."""
    items = []
    for line in m.group(1).splitlines():
        entry = re.match(r"^(.+?)\s*<([^>]+)>\s*$", line.strip())
        if entry and entry.group(2) != "self" and not entry.group(2).startswith("http"):
            items.append(f"- [{entry.group(1)}]({entry.group(2)}.md)")
    return "\n".join(items) + "\n" if items else ""


def include(m):
    f = (src / m.group(1)).resolve()
    code = f.read_text(encoding="utf-8").rstrip("\n")
    return f"```{m.group(2)}\n{code}\n```"

for md in sorted(src.rglob("*.md")):
    rel = md.relative_to(src)
    if rel.parts[0].startswith("_") or rel.as_posix() == "index.md":
        continue
    pid = rel.with_suffix("").as_posix()
    text = md.read_text(encoding="utf-8")
    text = TOCTREE.sub(toctree, text)
    text = INCLUDE.sub(include, text)
    title = re.search(r"^#\s+(.+)$", text, re.M).group(1).strip()
    lang = "both" if pid == "example-plugin" else ("es" if pid.endswith("-es") else "en")
    pages[pid] = {"id": pid, "lang": lang, "title": title, "md": text.strip() + "\n"}

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("window.CS_DOCS = " + json.dumps(pages, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
print(f"{len(pages)} páginas -> {out} ({out.stat().st_size // 1024} KB)")
