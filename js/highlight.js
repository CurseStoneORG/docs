/*
 * Resaltado de sintaxis mínimo (Lua, YAML, Bash, INI). Sin dependencias.
 * Cada regla es una expresión SIN grupos de captura; se combinan en una sola.
 */
(function (root) {
  'use strict';

  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var STRING = '"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'';

  var LANGS = {
    lua: [
      ['c', '--\\[\\[[\\s\\S]*?\\]\\]|--[^\\n]*'],
      ['s', STRING],
      ['n', '\\b\\d+(?:\\.\\d+)?\\b'],
      ['k', '\\b(?:and|break|do|else|elseif|end|for|function|goto|if|in|local|not|or|repeat|return|then|until|while)\\b'],
      ['l', '\\b(?:true|false|nil)\\b'],
      ['f', '\\b[A-Za-z_][\\w]*(?=\\s*[({"\'])'],
    ],
    yaml: [
      ['c', '(?:^|\\s)#[^\\n]*'],
      ['s', STRING],
      ['p', '^[ \\t]*(?:-[ \\t]+)?[\\w.\\-]+(?=:(?:\\s|$))'],
      ['l', '\\b(?:true|false|null)\\b'],
      ['n', '\\b\\d+(?:\\.\\d+)?\\b'],
    ],
    bash: [
      ['c', '(?:^|\\s)#[^\\n]*'],
      ['s', STRING],
      ['v', '\\$\\{?\\w+\\}?'],
      ['p', '(?:^|\\s)--?[A-Za-z][\\w-]*'],
    ],
    ini: [
      ['c', '^[;#][^\\n]*'],
      ['p', '^\\[[^\\]\\n]+\\]'],
      ['k', '^[\\w.\\-]+(?==)'],
    ],
  };

  LANGS.yml = LANGS.yaml;
  LANGS.sh = LANGS.bash;
  LANGS.shell = LANGS.bash;

  var cache = {};

  function compile(lang) {
    if (cache[lang]) return cache[lang];

    var rules = LANGS[lang];
    var combined = new RegExp(rules.map(function (r) { return '(' + r[1] + ')'; }).join('|'), 'gm');
    cache[lang] = { re: combined, classes: rules.map(function (r) { return r[0]; }) };
    return cache[lang];
  }

  function highlight(code, lang) {
    if (!LANGS[lang]) return esc(code);

    var compiled = compile(lang);
    var re = compiled.re;
    var out = '';
    var last = 0;
    var m;

    re.lastIndex = 0;

    while ((m = re.exec(code)) !== null) {
      if (m[0] === '') {
        re.lastIndex++;
        continue;
      }

      var cls = null;
      for (var g = 1; g < m.length; g++) {
        if (m[g] !== undefined) {
          cls = compiled.classes[g - 1];
          break;
        }
      }

      var text = m[0];
      var lead = '';

      // Los comentarios y flags pueden empezar con un espacio que no se pinta.
      if ((cls === 'c' || cls === 'p') && /^\s/.test(text)) {
        lead = text.charAt(0);
        text = text.slice(1);
      }

      out += esc(code.slice(last, m.index)) + esc(lead) + '<span class="tok-' + cls + '">' + esc(text) + '</span>';
      last = m.index + m[0].length;
    }

    return out + esc(code.slice(last));
  }

  root.CSHighlight = { highlight: highlight };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.CSHighlight;
})(typeof window !== 'undefined' ? window : globalThis);
