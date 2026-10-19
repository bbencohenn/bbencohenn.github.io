// Runs in <head> before first paint so a saved theme doesn't flash.
// Kept as an external file so the Content-Security-Policy can forbid inline scripts.
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    /* storage blocked: fall back to the system setting */
  }
})();
