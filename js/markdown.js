/*
 * Renderizador de Markdown mínimo para los docs de CurseStone.
 * Soporta: títulos, párrafos, listas anidadas, tablas, bloques de código,
 * avisos (:::{note|tip|warning}), citas, negrita, cursiva, código en línea y enlaces.
 * Sin dependencias y sin módulos ES, así que funciona abriendo index.html directamente.
 */
(function (root) {
  'use strict';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Misma regla que GitHub: minúsculas, sin signos, espacios -> guiones.
  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/[`*]/g, '')
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function dirname(id) {
    var i = id.lastIndexOf('/');
    return i < 0 ? '' : id.slice(0, i);
  }

  function normalizePath(path) {
    var out = [];
    path.split('/').forEach(function (part) {
      if (part === '' || part === '.') return;
      if (part === '..') out.pop();
      else out.push(part);
    });
    return out.join('/');
  }

  /* ---------- Enlaces ---------- */
  function resolveHref(url, ctx) {
    if (/^(https?:|mailto:)/i.test(url)) {
      return { href: url, external: true };
    }

    if (url.charAt(0) === '#') {
      var own = url.slice(1);
      return { href: '#/' + ctx.pageId + '?' + encodeURIComponent(own), external: false };
    }

    var parts = url.split('#');
    var target = parts[0];
    var anchor = parts[1] || '';

    if (/\.md$/.test(target)) {
      var base = dirname(ctx.pageId);
      var id = normalizePath((base ? base + '/' : '') + target.replace(/\.md$/, ''));
      var href = '#/' + id + (anchor ? '?' + encodeURIComponent(anchor) : '');
      return { href: href, external: false, id: id, anchor: anchor };
    }

    return { href: url, external: false };
  }

  /* ---------- Inline ---------- */
  function inline(src, ctx) {
    var codes = [];

    src = src.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, function (m, ticks, code) {
      codes.push(code);
      return '\u0000' + (codes.length - 1) + '\u0000';
    });

    src = esc(src);

    src = src.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
      var link = resolveHref(url.replace(/&amp;/g, '&'), ctx);
      if (ctx.links) ctx.links.push(link);
      var attrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a href="' + link.href + '"' + attrs + '>' + text + '</a>';
    });

    src = src.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:])/g, function (m, pre, url) {
      return pre + '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });

    src = src.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    src = src.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, '$1<em>$2</em>');

    return src.replace(/\u0000(\d+)\u0000/g, function (m, n) {
      return '<code>' + esc(codes[Number(n)]) + '</code>';
    });
  }

  /* ---------- Bloques ---------- */
  var RE = {
    fence: /^(\s*)(`{3,}|~{3,})\s*([\w{}.+-]*)\s*$/,
    heading: /^(#{1,6})\s+(.*?)\s*#*\s*$/,
    hr: /^\s*([-*_])(\s*\1){2,}\s*$/,
    admon: /^:::\{(\w+)\}\s*(.*)$/,
    list: /^(\s*)([-*+]|\d+[.)])\s+(.*)$/,
    quote: /^\s*>\s?(.*)$/,
    tableSep: /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/,
  };

  function indentOf(line) {
    return line.match(/^\s*/)[0].replace(/\t/g, '    ').length;
  }

  function isBlank(line) {
    return /^\s*$/.test(line);
  }

  function splitRow(line) {
    var text = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    var cells = [];
    var current = '';
    var inCode = false;

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);

      if (ch === '\\' && text.charAt(i + 1) === '|') {
        current += '|';
        i++;
      } else if (ch === '`') {
        inCode = !inCode;
        current += ch;
      } else if (ch === '|' && !inCode) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }

    cells.push(current.trim());
    return cells;
  }

  function startsBlock(line, next) {
    return (
      RE.fence.test(line) ||
      RE.heading.test(line) ||
      RE.admon.test(line) ||
      RE.hr.test(line) ||
      RE.list.test(line) ||
      RE.quote.test(line) ||
      (/^\s*\|/.test(line) && next !== undefined && RE.tableSep.test(next))
    );
  }

  function renderBlocks(lines, ctx, tight) {
    var html = '';
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (isBlank(line)) {
        i++;
        continue;
      }

      /* Código */
      var fence = line.match(RE.fence);
      if (fence) {
        var marker = fence[2];
        var strip = fence[1].length;
        var body = [];
        i++;

        while (i < lines.length && lines[i].trim().indexOf(marker) !== 0) {
          body.push(lines[i].slice(Math.min(strip, indentOf(lines[i]))));
          i++;
        }

        i++;
        html += ctx.code(body.join('\n'), fence[3]);
        continue;
      }

      /* Aviso */
      var admon = line.match(RE.admon);
      if (admon) {
        var inner = [];
        i++;

        while (i < lines.length && lines[i].trim() !== ':::') {
          inner.push(lines[i]);
          i++;
        }

        i++;
        html += ctx.admonition(admon[1], renderBlocks(inner, ctx, false));
        continue;
      }

      /* Título */
      var heading = line.match(RE.heading);
      if (heading) {
        var level = heading[1].length;
        var raw = heading[2];
        var base = slugify(raw);
        var id = base;
        var n = 1;

        while (ctx.ids[id]) id = base + '-' + n++;
        ctx.ids[id] = true;

        if (level === 2 || level === 3) ctx.toc.push({ level: level, id: id, text: raw.replace(/[`*]/g, '') });

        var anchor = level > 1
          ? '<a class="anchor" href="#/' + ctx.pageId + '?' + encodeURIComponent(id) + '" aria-label="#">#</a>'
          : '';

        html += '<h' + level + ' id="' + esc(id) + '">' + inline(raw, ctx) + anchor + '</h' + level + '>';
        i++;
        continue;
      }

      /* Separador */
      if (RE.hr.test(line)) {
        html += '<hr>';
        i++;
        continue;
      }

      /* Tabla */
      if (/^\s*\|/.test(line) && i + 1 < lines.length && RE.tableSep.test(lines[i + 1])) {
        var head = splitRow(line);
        var rows = [];
        i += 2;

        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }

        var hasHead = head.some(function (cell) { return cell !== ''; });
        var table = '<div class="table-wrap"><table>';

        if (hasHead) {
          table += '<thead><tr>' + head.map(function (c) { return '<th>' + inline(c, ctx) + '</th>'; }).join('') + '</tr></thead>';
        }

        table += '<tbody>' + rows.map(function (row) {
          return '<tr>' + row.map(function (c) { return '<td>' + inline(c, ctx) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';

        html += table;
        continue;
      }

      /* Cita */
      if (RE.quote.test(line)) {
        var quoted = [];

        while (i < lines.length && RE.quote.test(lines[i])) {
          quoted.push(lines[i].match(RE.quote)[1]);
          i++;
        }

        html += '<blockquote>' + renderBlocks(quoted, ctx, false) + '</blockquote>';
        continue;
      }

      /* Lista */
      var listStart = line.match(RE.list);
      if (listStart) {
        var result = renderList(lines, i, ctx);
        html += result.html;
        i = result.next;
        continue;
      }

      /* Párrafo */
      var para = [line.trim()];
      i++;

      while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines[i], lines[i + 1])) {
        para.push(lines[i].trim());
        i++;
      }

      var text = inline(para.join(' '), ctx);
      html += tight ? text : '<p>' + text + '</p>';
    }

    return html;
  }

  function renderList(lines, start, ctx) {
    var first = lines[start].match(RE.list);
    var baseIndent = first[1].replace(/\t/g, '    ').length;
    var ordered = /\d/.test(first[2]);
    var startNumber = ordered ? parseInt(first[2], 10) : 1;
    var items = [];
    var i = start;

    while (i < lines.length) {
      var m = lines[i].match(RE.list);

      if (!m) break;
      if (m[1].replace(/\t/g, '    ').length > baseIndent + 1) break;
      if (/\d/.test(m[2]) !== ordered) break;

      var offset = m[1].replace(/\t/g, '    ').length + m[2].length + 1;
      var body = [m[3]];
      var loose = false;
      i++;

      while (i < lines.length) {
        var cur = lines[i];

        if (isBlank(cur)) {
          var j = i;
          while (j < lines.length && isBlank(lines[j])) j++;

          if (j < lines.length && indentOf(lines[j]) > baseIndent + 1) {
            loose = true;
            for (; i < j; i++) body.push('');
            continue;
          }
          break;
        }

        if (indentOf(cur) > baseIndent + 1) {
          body.push(cur.slice(Math.min(offset, indentOf(cur))));
          i++;
          continue;
        }

        break;
      }

      items.push({ body: body, loose: loose });
    }

    var tag = ordered ? 'ol' : 'ul';
    var attr = ordered && startNumber !== 1 ? ' start="' + startNumber + '"' : '';
    var out = '<' + tag + attr + '>';

    items.forEach(function (item) {
      out += '<li>' + renderBlocks(item.body, ctx, !item.loose) + '</li>';
    });

    return { html: out + '</' + tag + '>', next: i };
  }

  /* ---------- API ---------- */
  function render(markdown, options) {
    var ctx = {
      pageId: options.pageId,
      ids: {},
      toc: [],
      links: options.collectLinks ? [] : null,
      code: options.code,
      admonition: options.admonition,
    };

    var html = renderBlocks(markdown.replace(/\r\n?/g, '\n').split('\n'), ctx, false);
    return { html: html, toc: ctx.toc, links: ctx.links, ids: ctx.ids };
  }

  root.CSMarkdown = { render: render, escapeHtml: esc, slugify: slugify };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.CSMarkdown;
})(typeof window !== 'undefined' ? window : globalThis);
