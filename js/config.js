/*
 * Textos de la interfaz (ES / EN), enlaces del proyecto y estructura del menú lateral.
 * Los textos de las guías vienen de js/data/docs.js (generado desde los .md).
 */
(function (root) {
  'use strict';

  var ORG = 'https://github.com/CurseStoneORG';

  var SITE = {
    name: 'CurseStone',
    logo: 'https://raw.githubusercontent.com/CurseStoneORG/CurseStone/stable/logo.svg',
    repo: ORG + '/CurseStone',
    discord: 'https://discord.gg/h6TXynYC8p',
    youtube: 'https://youtube.com/@CurseStoneTeam',
    org: ORG,
    doxygen: 'https://CurseStoneORG.github.io/doxygen-docs',
    website: 'https://CurseStoneORG.github.io/',
    apiVersion: '1.0.2',
    storage: { theme: 'cursestone-theme', lang: 'cursestone-docs-lang' },
  };

  var STRINGS = {
    es: {
      'meta.description': 'Documentación oficial de CurseStone: instalación del servidor MCPE 0.15.x y guía de plugins en Lua 5.4.',
      'nav.label': 'Navegación de la documentación',
      'nav.open': 'Abrir menú',
      'nav.docs': 'Documentación',
      'ui.search': 'Buscar en la documentación',
      'ui.path': 'Ruta',
      'ui.github': 'Ver en GitHub',
      'ui.theme': 'Cambiar tema',
      'ui.themeLabel': 'Cambiar entre tema claro y oscuro',
      'ui.language': 'Idioma',
      'ui.copy': 'Copiar al portapapeles',
      'ui.prev': 'Anterior',
      'ui.next': 'Siguiente',
      'ui.toc': 'En esta página',
      'ui.noResults': 'Sin resultados para «{q}».',
      'ui.results': '{n} resultados',
      'ui.noscript': 'Esta documentación necesita JavaScript para mostrarse.',
      'admon.note': 'Nota',
      'admon.tip': 'Consejo',
      'admon.warning': 'Aviso',
      'notfound.title': 'Página no encontrada',
      'notfound.text': 'Esa página no existe en la documentación.',
      'notfound.back': 'Volver al inicio',
      'footer.copyright': '© {year} {name}. Documentación del servidor y de la API de plugins {api}.',

      'home.eyebrow': 'MCPE 0.15.x · Protocolo 84',
      'home.title': 'Documentación de CurseStone',
      'home.lead': 'CurseStone es un software de servidor para Minecraft: Pocket Edition 0.15.x (protocolo 84). Tiene un núcleo en C puro para red, NBT y datos de chunks, con la lógica del juego escrita en C++20.',
      'home.intro': 'Si quieres ejecutar un servidor MCPE pequeño que puedas leer, compilar y modificar, esto es para ti. Lee los docs en este orden:',
      'home.start': 'Empezar',
      'home.spec.target': 'Compatible con',
      'home.spec.core': 'Núcleo',
      'home.spec.logic': 'Lógica',
      'home.spec.script': 'Plugins',
      'home.card.installation.title': 'Guía de instalación',
      'home.card.installation.text': 'Instala, ejecuta y actualiza un servidor CurseStone.',
      'home.card.plugins.title': 'Guía de plugins',
      'home.card.plugins.text': 'Desarrolla plugins en Lua 5.4 con la API oficial {api}.',
      'home.card.example.title': 'Plugin de ejemplo',
      'home.card.example.text': 'Un plugin de referencia que puedes copiar y ejecutar tal cual.',
      'home.card.doxygen.title': 'Referencia del código (Doxygen)',
      'home.card.doxygen.text': 'Todo el software documentado desde su código fuente.',
      'home.open': 'Abrir',
    },
    en: {
      'meta.description': 'Official CurseStone documentation: install the MCPE 0.15.x server and develop Lua 5.4 plugins.',
      'nav.label': 'Documentation navigation',
      'nav.open': 'Open menu',
      'nav.docs': 'Documentation',
      'ui.search': 'Search the docs',
      'ui.path': 'Path',
      'ui.github': 'View on GitHub',
      'ui.theme': 'Toggle theme',
      'ui.themeLabel': 'Switch between light and dark theme',
      'ui.language': 'Language',
      'ui.copy': 'Copy to clipboard',
      'ui.prev': 'Previous',
      'ui.next': 'Next',
      'ui.toc': 'On this page',
      'ui.noResults': 'No results for "{q}".',
      'ui.results': '{n} results',
      'ui.noscript': 'This documentation needs JavaScript to be displayed.',
      'admon.note': 'Note',
      'admon.tip': 'Tip',
      'admon.warning': 'Warning',
      'notfound.title': 'Page not found',
      'notfound.text': 'That page does not exist in the documentation.',
      'notfound.back': 'Back to the start',
      'footer.copyright': '© {year} {name}. Server and plugin API {api} documentation.',

      'home.eyebrow': 'MCPE 0.15.x · Protocol 84',
      'home.title': 'CurseStone Documentation',
      'home.lead': 'CurseStone is a server software for Minecraft: Pocket Edition 0.15.x (protocol 84). It has a plain C core for networking, NBT and chunk data, with the game logic written in C++20.',
      'home.intro': 'If you want to run a small MCPE server that you can read, build and modify, this is for you. Read the docs in this order:',
      'home.start': 'Get started',
      'home.spec.target': 'Compatible with',
      'home.spec.core': 'Core',
      'home.spec.logic': 'Logic',
      'home.spec.script': 'Plugins',
      'home.card.installation.title': 'Installation guide',
      'home.card.installation.text': 'Install, run and update a CurseStone server.',
      'home.card.plugins.title': 'Plugin guide',
      'home.card.plugins.text': 'Develop Lua 5.4 plugins with the official API {api}.',
      'home.card.example.title': 'Example plugin',
      'home.card.example.text': 'A reference plugin you can copy and run as it is.',
      'home.card.doxygen.title': 'Code reference (Doxygen)',
      'home.card.doxygen.text': 'The whole software documented from its source code.',
      'home.open': 'Open',
    },
  };

  /*
   * Menú lateral. `id` es el nombre del .md sin extensión (ver js/data/docs.js).
   * Un elemento con `children` muestra sus subpáginas debajo.
   */
  var NAV = {
    en: [
      { id: 'home', icon: 'fa-solid fa-house', title: 'Home' },
      { id: 'installation', icon: 'fa-solid fa-download', title: 'Installation guide' },
      {
        id: 'plugins/index', icon: 'fa-solid fa-puzzle-piece', title: 'Plugin guide',
        children: [
          { id: 'plugins/commands', title: 'Commands and permissions' },
          { id: 'plugins/events', title: 'Events' },
          { id: 'plugins/scheduler', title: 'Scheduled tasks' },
          { id: 'plugins/data', title: 'Data and configuration' },
          { id: 'plugins/worlds', title: 'Worlds' },
          { id: 'plugins/players', title: 'Players' },
          { id: 'plugins/api-reference', title: 'Full API reference' },
          { id: 'plugins/best-practices', title: 'Best practices' },
        ],
      },
      { id: 'example-plugin', icon: 'fa-solid fa-flask', title: 'Example plugin' },
      { href: SITE.doxygen, icon: 'fa-solid fa-code', title: 'Code reference (Doxygen)' },
    ],
    es: [
      { id: 'home', icon: 'fa-solid fa-house', title: 'Inicio' },
      { id: 'installation-es', icon: 'fa-solid fa-download', title: 'Guía de instalación' },
      {
        id: 'plugins/index-es', icon: 'fa-solid fa-puzzle-piece', title: 'Guía de plugins',
        children: [
          { id: 'plugins/comandos-es', title: 'Comandos y permisos' },
          { id: 'plugins/eventos-es', title: 'Eventos' },
          { id: 'plugins/planificador-es', title: 'Tareas programadas' },
          { id: 'plugins/datos-es', title: 'Datos y configuración' },
          { id: 'plugins/mundos-es', title: 'Mundos' },
          { id: 'plugins/jugadores-es', title: 'Jugadores' },
          { id: 'plugins/referencia-api-es', title: 'Referencia completa de la API' },
          { id: 'plugins/buenas-practicas-es', title: 'Buenas prácticas' },
        ],
      },
      { id: 'example-plugin', icon: 'fa-solid fa-flask', title: 'Plugin de ejemplo' },
      { href: SITE.doxygen, icon: 'fa-solid fa-code', title: 'Referencia del código (Doxygen)' },
    ],
  };

  // Página equivalente en el otro idioma (la de ejemplo y el inicio sirven para ambos).
  var MIRROR = {
    'installation': 'installation-es',
    'plugins/index': 'plugins/index-es',
    'plugins/commands': 'plugins/comandos-es',
    'plugins/events': 'plugins/eventos-es',
    'plugins/scheduler': 'plugins/planificador-es',
    'plugins/data': 'plugins/datos-es',
    'plugins/worlds': 'plugins/mundos-es',
    'plugins/players': 'plugins/jugadores-es',
    'plugins/api-reference': 'plugins/referencia-api-es',
    'plugins/best-practices': 'plugins/buenas-practicas-es',
  };

  Object.keys(MIRROR).forEach(function (en) {
    MIRROR[MIRROR[en]] = en;
  });

  root.CSConfig = { SITE: SITE, STRINGS: STRINGS, NAV: NAV, MIRROR: MIRROR };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.CSConfig;
})(typeof window !== 'undefined' ? window : globalThis);
