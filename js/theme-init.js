(function () {
  var stored = null;

  try {
    stored = localStorage.getItem('cursestone-theme');
  } catch (error) {}

  document.documentElement.dataset.theme = stored === 'light' ? 'light' : 'dark';

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', stored === 'light' ? '#fcfcfc' : '#151618');
})();
