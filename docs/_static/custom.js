(function () {
  var STORAGE_KEY = 'cursestone-docs-lang';
  var root = document.documentElement;

  function preferred() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'es' || stored === 'en') return stored;
    } catch (error) {}

    return (navigator.language || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  function apply(lang) {
    root.setAttribute('data-doc-lang', lang);

    document.querySelectorAll('.cs-lang-switch button').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.docLang === lang));
    });
  }

  apply(preferred());

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-doc-lang'));

    document.addEventListener('click', function (event) {
      var button = event.target.closest('.cs-lang-switch button');
      if (!button) return;

      var lang = button.dataset.docLang;
      apply(lang);

      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (error) {}
    });
  });
})();
