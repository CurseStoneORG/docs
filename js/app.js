/*
 * CurseStone Docs: lógica principal.
 * Enrutado por hash (#/installation, #/plugins/events?anchor), sin servidor ni módulos ES,
 * así que funciona abriendo index.html directamente o publicado en cualquier hosting estático.
 */
(function () {
  'use strict';

  var CFG = window.CSConfig;
  var SITE = CFG.SITE;
  var MD = window.CSMarkdown;
  var HL = window.CSHighlight;
  var pages = window.CS_DOCS || {};

  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('nav-scrim');
  var breadcrumbs = document.getElementById('breadcrumbs');
  var main = document.getElementById('page');
  var pager = document.getElementById('pager');
  var footer = document.getElementById('footer');
  var menuToggle = document.getElementById('menu-toggle');
  var description = document.querySelector('meta[name="description"]');

  /* ---------- Utilidades ---------- */
  var esc = MD.escapeHtml;

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* solo dura mientras la pestaña esté abierta */ }
  }

  var lang = (function () {
    var stored = storageGet(SITE.storage.lang);
    if (stored === 'es' || stored === 'en') return stored;
    return (navigator.language || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  })();

  function t(key, params) {
    var text = CFG.STRINGS[lang][key] || CFG.STRINGS.es[key] || key;
    params = params || {};
    return text.replace(/\{(\w+)\}/g, function (m, name) {
      return params[name] !== undefined ? params[name] : '';
    });
  }

  function brand() {
    return '<span class="tone-a">Curse</span><span class="tone-b">Stone</span>';
  }

  function logo(size) {
    return '<img class="logo" src="' + SITE.logo + '" alt="" width="' + size + '" height="' + size +
      '" decoding="async" onerror="this.hidden=true">';
  }

  function href(id) {
    return '#/' + id;
  }

  /* ---------- Ruta ---------- */
  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, '');
    var q = raw.indexOf('?');
    var id = q < 0 ? raw : raw.slice(0, q);
    var anchor = '';

    if (q >= 0) {
      try { anchor = decodeURIComponent(raw.slice(q + 1)); } catch (e) { anchor = raw.slice(q + 1); }
    }

    return { id: id || 'home', anchor: anchor };
  }

  function navItems() {
    return CFG.NAV[lang];
  }

  function navTitle(id) {
    var found = null;

    navItems().forEach(function (item) {
      if (item.id === id) found = item;
      (item.children || []).forEach(function (child) {
        if (child.id === id) found = child;
      });
    });

    return found ? found.title : (pages[id] ? pages[id].title : id);
  }

  function parentOf(id) {
    var parent = null;

    navItems().forEach(function (item) {
      (item.children || []).forEach(function (child) {
        if (child.id === id) parent = item;
      });
    });

    return parent;
  }

  // Orden lineal para los botones Anterior / Siguiente.
  function flatOrder() {
    var list = [];

    navItems().forEach(function (item) {
      if (item.id) list.push(item.id);
      (item.children || []).forEach(function (child) { list.push(child.id); });
    });

    return list;
  }

  /* ---------- Piezas ---------- */
  var ADMON_ICONS = { note: 'fa-circle-info', tip: 'fa-lightbulb', warning: 'fa-triangle-exclamation' };

  function codeBlock(code, language) {
    var body = language ? HL.highlight(code, language) : esc(code);
    var cls = language ? ' class="language-' + esc(language) + '"' : '';

    return '<div class="code-block">' +
      '<pre><code' + cls + '>' + body + '</code></pre>' +
      '<button class="icon-btn copy-btn" type="button" data-copy aria-label="' + esc(t('ui.copy')) + '">' +
      '<i class="fa-regular fa-copy"></i></button></div>';
  }

  function admonition(type, inner) {
    var kind = ADMON_ICONS[type] ? type : 'note';

    return '<div class="admonition ' + kind + '">' +
      '<p class="admonition-title"><i class="fa-solid ' + ADMON_ICONS[kind] + '"></i> ' + esc(t('admon.' + kind)) + '</p>' +
      inner + '</div>';
  }

  function button(opts) {
    var cls = 'btn' + (opts.primary ? ' btn-primary' : '') + (opts.large ? ' btn-lg' : '');
    var ext = opts.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    var icon = opts.icon ? '<i class="' + opts.icon + '" aria-hidden="true"></i> ' : '';

    return '<a class="' + cls + '" href="' + esc(opts.href) + '"' + ext + '>' + icon + esc(opts.label) + '</a>';
  }

  function themeToggle() {
    return '<button class="icon-btn" type="button" data-theme-toggle aria-label="' + esc(t('ui.themeLabel')) +
      '" title="' + esc(t('ui.theme')) + '"><i class="fa-solid fa-moon theme-icon-moon"></i>' +
      '<i class="fa-solid fa-sun theme-icon-sun"></i></button>';
  }

  function langToggle() {
    return '<div class="lang-toggle" role="group" aria-label="' + esc(t('ui.language')) + '">' +
      [['es', 'ESP'], ['en', 'ENG']].map(function (l) {
        return '<button type="button" data-lang="' + l[0] + '" aria-pressed="' + (l[0] === lang) + '">' + l[1] + '</button>';
      }).join('') + '</div>';
  }

  /* ---------- Barra lateral ---------- */
  function renderSidebar(currentId) {
    var items = navItems().map(function (item) {
      var link = item.href
        ? '<a href="' + esc(item.href) + '" target="_blank" rel="noopener noreferrer"><i class="' + item.icon +
          '" aria-hidden="true"></i>' + esc(item.title) + '<i class="fa-solid fa-arrow-up-right-from-square sidebar-ext" aria-hidden="true"></i></a>'
        : '<a href="' + href(item.id) + '"><i class="' + item.icon + '" aria-hidden="true"></i>' + esc(item.title) + '</a>';

      var kids = item.children
        ? '<ul class="sidebar-sub">' + item.children.map(function (child) {
            return '<li data-id="' + child.id + '"><a href="' + href(child.id) + '">' + esc(child.title) + '</a></li>';
          }).join('') + '</ul>'
        : '';

      return '<li data-id="' + (item.id || '') + '">' + link + kids + '</li>';
    }).join('');

    sidebar.setAttribute('aria-label', t('nav.label'));
    sidebar.innerHTML =
      '<div class="sidebar-head">' +
        '<a class="sidebar-title" href="' + href('home') + '">' + logo(30) + '<span>' + brand() + ' <small>Docs</small></span></a>' +
        '<div class="version"><i class="fa-solid fa-puzzle-piece"></i> API ' + SITE.apiVersion + '</div>' +
        '<form class="search" role="search"><input type="search" placeholder="' + esc(t('ui.search')) +
        '" aria-label="' + esc(t('ui.search')) + '" autocomplete="off"></form>' +
      '</div>' +
      '<ul class="sidebar-menu" id="sidebar-menu">' + items + '</ul>' +
      '<div class="search-results" id="search-results" hidden></div>' +
      '<div class="sidebar-foot">' +
        [['Discord', 'fa-brands fa-discord', SITE.discord], ['GitHub', 'fa-brands fa-github', SITE.org], ['YouTube', 'fa-brands fa-youtube', SITE.youtube]]
          .map(function (s) {
            return '<a class="icon-btn" href="' + s[2] + '" target="_blank" rel="noopener noreferrer" aria-label="' + s[0] +
              '" title="' + s[0] + '"><i class="' + s[1] + '"></i></a>';
          }).join('') +
      '</div>';

    markActive(currentId);
  }

  function markActive(id) {
    sidebar.querySelectorAll('.sidebar-menu li').forEach(function (li) {
      li.classList.toggle('current', li.dataset.id === id);
    });
  }

  /* ---------- Búsqueda ---------- */
  var searchIndex = null;

  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function plain(line) {
    return line.replace(/[`*#|>]/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
  }

  function buildIndex() {
    searchIndex = Object.keys(pages).map(function (id) {
      var page = pages[id];
      return { page: page, title: norm(page.title), text: norm(page.md), lines: page.md.split('\n') };
    });
  }

  function runSearch(query) {
    if (!searchIndex) buildIndex();

    var words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return [];

    var hits = [];

    searchIndex.forEach(function (entry) {
      if (entry.page.lang !== 'both' && entry.page.lang !== lang) return;

      var score = 0;
      var ok = words.every(function (w) {
        var inTitle = entry.title.indexOf(w) >= 0;
        var count = entry.text.split(w).length - 1;
        if (!inTitle && !count) return false;
        score += (inTitle ? 20 : 0) + Math.min(count, 10);
        return true;
      });

      if (!ok) return;

      var snippet = '';
      for (var i = 0; i < entry.lines.length; i++) {
        if (norm(entry.lines[i]).indexOf(words[0]) >= 0 && !/^#\s/.test(entry.lines[i])) {
          snippet = plain(entry.lines[i]);
          break;
        }
      }

      hits.push({ id: entry.page.id, title: navTitle(entry.page.id), snippet: snippet.slice(0, 110), score: score });
    });

    return hits.sort(function (a, b) { return b.score - a.score; }).slice(0, 20);
  }

  function showSearch(query) {
    var menu = document.getElementById('sidebar-menu');
    var box = document.getElementById('search-results');
    var q = query.trim();

    menu.hidden = !!q;
    box.hidden = !q;
    if (!q) return;

    var hits = runSearch(q);

    box.innerHTML = hits.length
      ? '<p class="search-count">' + esc(t('ui.results', { n: hits.length })) + '</p><ul>' + hits.map(function (h) {
          return '<li><a href="' + href(h.id) + '"><strong>' + esc(h.title) + '</strong>' +
            (h.snippet ? '<span>' + esc(h.snippet) + '</span>' : '') + '</a></li>';
        }).join('') + '</ul>'
      : '<p class="search-count">' + esc(t('ui.noResults', { q: q })) + '</p>';
  }

  /* ---------- Páginas ---------- */
  function renderHome() {
    var cards = [
      { n: '01', key: 'installation', href: href(lang === 'es' ? 'installation-es' : 'installation'), label: t('home.start') },
      { n: '02', key: 'plugins', href: href(lang === 'es' ? 'plugins/index-es' : 'plugins/index'), label: t('home.open') },
      { n: '03', key: 'example', href: href('example-plugin'), label: t('home.open') },
      { n: '04', key: 'doxygen', href: SITE.doxygen, label: t('home.open'), external: true },
    ];

    var specs = [
      [t('home.spec.target'), 'MCPE 0.15.x'],
      [t('home.spec.core'), 'C'],
      [t('home.spec.logic'), 'C++20'],
      [t('home.spec.script'), 'Lua 5.4'],
    ];

    return '<section class="hero">' +
      '<p class="eyebrow">' + esc(t('home.eyebrow')) + '</p>' +
      '<h1>' + esc(t('home.title')) + '</h1>' +
      '<p class="lead">' + esc(t('home.lead')) + '</p>' +
      '<dl class="spec-row">' + specs.map(function (s) {
        return '<div class="spec"><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>';
      }).join('') + '</dl>' +
      '<p>' + esc(t('home.intro')) + '</p>' +
      '<div class="button-row">' +
        button({ href: cards[0].href, label: t('home.start'), icon: 'fa-solid fa-rocket', primary: true, large: true }) +
        button({ href: SITE.discord, label: 'Discord', icon: 'fa-brands fa-discord', external: true, large: true }) +
        button({ href: SITE.repo, label: 'GitHub', icon: 'fa-brands fa-github', external: true, large: true }) +
      '</div></section>' +
      '<ol class="step-cards">' + cards.map(function (c) {
        var params = { api: SITE.apiVersion };
        return '<li><a class="step-card" href="' + esc(c.href) + '"' +
          (c.external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
          '<span class="step-n">' + c.n + '</span>' +
          '<strong>' + esc(t('home.card.' + c.key + '.title')) + '</strong>' +
          '<span class="step-text">' + esc(t('home.card.' + c.key + '.text', params)) + '</span>' +
          '<span class="step-go">' + esc(c.label) + ' <i class="fa-solid fa-arrow-right"></i></span></a></li>';
      }).join('') + '</ol>';
  }

  function renderDoc(page) {
    var result = MD.render(page.md, { pageId: page.id, code: codeBlock, admonition: admonition });
    var html = result.html;

    var h2s = result.toc.filter(function (e) { return e.level === 2; });
    if (h2s.length >= 3) {
      var toc = '<details class="toc"><summary><i class="fa-solid fa-list-ul"></i> ' + esc(t('ui.toc')) + '</summary><ol>' +
        h2s.map(function (e) {
          return '<li><a href="#/' + page.id + '?' + encodeURIComponent(e.id) + '">' + esc(e.text) + '</a></li>';
        }).join('') + '</ol></details>';

      html = html.replace('</h1>', '</h1>' + toc);
    }

    return '<article class="doc">' + html + '</article>';
  }

  function renderNotFound() {
    return '<h1>' + esc(t('notfound.title')) + '</h1><p>' + esc(t('notfound.text')) + '</p>' +
      button({ href: href('home'), label: t('notfound.back'), icon: 'fa-solid fa-house', primary: true });
  }

  function renderBreadcrumbs(id) {
    var crumbs = '<li><a href="' + href('home') + '">' + SITE.name + '</a><span aria-hidden="true">/</span></li>';

    if (id !== 'home') {
      var parent = parentOf(id);
      if (parent) {
        crumbs += '<li><a href="' + href(parent.id) + '">' + esc(parent.title) + '</a><span aria-hidden="true">/</span></li>';
      }
      crumbs += '<li aria-current="page">' + esc(navTitle(id)) + '</li>';
    } else {
      crumbs += '<li aria-current="page">' + esc(t('nav.docs')) + '</li>';
    }

    return '<nav class="breadcrumbs" aria-label="' + esc(t('ui.path')) + '"><ul>' + crumbs + '</ul>' +
      '<div class="toolbar"><a class="toolbar-link" href="' + SITE.repo + '" target="_blank" rel="noopener noreferrer" aria-label="' +
      esc(t('ui.github')) + '"><i class="fa-brands fa-github" aria-hidden="true"></i> <span>' + esc(t('ui.github')) + '</span></a>' +
      langToggle() + themeToggle() + '</div></nav>';
  }

  function renderPager(id) {
    var order = flatOrder();
    var i = order.indexOf(id);
    if (i < 0) return '';

    function link(targetId, cls, label, arrowLeft) {
      var arrow = arrowLeft ? '<i class="fa-solid fa-arrow-left"></i> ' : '';
      var arrowR = arrowLeft ? '' : ' <i class="fa-solid fa-arrow-right"></i>';
      return '<a class="btn pager-btn ' + cls + '" href="' + href(targetId) + '">' + arrow +
        '<span><small>' + esc(label) + '</small><b>' + esc(navTitle(targetId)) + '</b></span>' + arrowR + '</a>';
    }

    return '<div class="pager">' +
      (i > 0 ? link(order[i - 1], 'pager-prev', t('ui.prev'), true) : '') +
      (i < order.length - 1 ? link(order[i + 1], 'pager-next', t('ui.next'), false) : '') + '</div>';
  }

  /* ---------- Render principal ---------- */
  var last = { id: null, lang: null };

  function scrollToAnchor(anchor) {
    var el = anchor ? document.getElementById(anchor) : null;
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }

  function render() {
    var route = parseHash();
    var id = route.id;
    var page = id === 'home' ? { id: 'home', lang: 'both' } : pages[id];

    if (page && page.lang !== 'both' && page.lang !== lang) {
      lang = page.lang;
      storageSet(SITE.storage.lang, lang);
    }

    // Solo cambió el ancla de la misma página: basta con desplazarse.
    if (page && last.id === id && last.lang === lang) {
      scrollToAnchor(route.anchor);
      return;
    }

    document.documentElement.lang = lang;
    document.title = (page ? (id === 'home' ? t('home.title') : navTitle(id)) : t('notfound.title')) + ' — ' + SITE.name;
    description.content = t('meta.description');
    menuToggle.setAttribute('aria-label', t('nav.open'));

    renderSidebar(id);
    breadcrumbs.innerHTML = renderBreadcrumbs(id);
    main.innerHTML = !page ? renderNotFound() : id === 'home' ? renderHome() : renderDoc(page);
    pager.innerHTML = page ? renderPager(id) : '';
    footer.innerHTML = '<p>' + esc(t('footer.copyright', { year: new Date().getFullYear(), name: SITE.name, api: SITE.apiVersion })) + '</p>';

    last = { id: id, lang: lang };
    scrollToAnchor(route.anchor);
  }

  /* ---------- Eventos ---------- */
  function switchLang(code) {
    if (code === lang) return;

    lang = code;
    storageSet(SITE.storage.lang, code);

    var id = parseHash().id;
    var mirror = CFG.MIRROR[id];

    if (mirror && pages[mirror]) {
      location.hash = href(mirror);   // hashchange vuelve a pintar
    } else {
      last = { id: null, lang: null };
      render();
    }
  }

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (e) { /* sin permiso */ }
    area.remove();
  }

  document.addEventListener('click', function (event) {
    var langBtn = event.target.closest('[data-lang]');
    if (langBtn) return switchLang(langBtn.dataset.lang);

    var themeBtn = event.target.closest('[data-theme-toggle]');
    if (themeBtn) {
      var root = document.documentElement;
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      document.querySelector('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#151618' : '#fcfcfc');
      storageSet(SITE.storage.theme, next);
      return;
    }

    var copyBtn = event.target.closest('[data-copy]');
    if (copyBtn) {
      var code = copyBtn.parentNode.querySelector('pre code').textContent;
      var done = function () {
        copyBtn.classList.add('copied');
        setTimeout(function () { copyBtn.classList.remove('copied'); }, 1500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, function () { legacyCopy(code); done(); });
      } else {
        legacyCopy(code);
        done();
      }
      return;
    }

    if (event.target.closest('#sidebar a')) {
      document.body.classList.remove('nav-open');

      var input = sidebar.querySelector('.search input');
      if (input && input.value) {
        input.value = '';
        showSearch('');
      }
    }
  });

  sidebar.addEventListener('submit', function (event) { event.preventDefault(); });
  sidebar.addEventListener('input', function (event) {
    if (event.target.matches('.search input')) showSearch(event.target.value);
  });

  menuToggle.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  scrim.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') document.body.classList.remove('nav-open');
  });

  window.addEventListener('hashchange', render);

  render();
})();
