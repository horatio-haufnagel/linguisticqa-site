// Shared consent banner for static pages (/risorse/, /de/ressourcen/, legal pages).
// The React SPA has its own component that reads/writes the same localStorage key (adr_consent).
// Replace G-XXXXXXXXXX with the real GA4 Measurement ID; leave as-is to disable GA entirely.
(function () {
  var KEY = 'adr_consent';
  var TTL = 15552000000; // 6 months in ms
  // The window.__GA_ID__ override lets tests inject a measurement ID at runtime
  // without touching this file.
  var GA_ID = (typeof window !== 'undefined' && window.__GA_ID__) || 'G-2QWBPF1GG1';

  if (GA_ID === 'G-XXXXXXXXXX') return; // placeholder sentinel: nothing to consent to

  function readConsent() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.ts || Date.now() - d.ts > TTL) { localStorage.removeItem(KEY); return null; }
      return d.choice;
    } catch (_) { return null; }
  }

  function writeConsent(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, ts: Date.now() })); } catch (_) {}
  }

  function loadGA(id) {
    if (document.getElementById('ga-script')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    var s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
  }

  var existing = readConsent();
  if (existing === 'granted') { loadGA(GA_ID); return; }
  if (existing === 'denied') return;

  // No stored choice: build and show the banner
  var lang = (document.documentElement.lang || 'it').slice(0, 2).toLowerCase();
  var strings = {
    it: { text: 'Questo sito usa cookie analitici (Google Analytics 4) per capire come viene usato.', accept: 'Accetta', reject: 'Rifiuta', privacy: 'Informativa sulla privacy', privacyUrl: '/it/privacy/' },
    de: { text: 'Diese Website verwendet Analyse-Cookies (Google Analytics 4), um zu verstehen, wie sie genutzt wird.', accept: 'Akzeptieren', reject: 'Ablehnen', privacy: 'Datenschutzerklärung', privacyUrl: '/de/datenschutz/' },
    en: { text: 'This site uses analytics cookies (Google Analytics 4) to understand how it is used.', accept: 'Accept', reject: 'Decline', privacy: 'Privacy policy', privacyUrl: '/privacy/' },
  };
  var s = strings[lang] || strings.en;

  var style = document.createElement('style');
  style.textContent = [
    '#cb{position:fixed;bottom:0;left:0;right:0;z-index:9999;',
    'background:var(--paper,#E7EAE4);color:var(--ink,#0E1512);',
    'border-top:1px solid var(--rule,rgba(14,21,18,.18));',
    'font-family:Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;',
    'font-size:.9rem;line-height:1.5;padding:.85rem 1.25rem}',
    '#cb .i{max-width:72rem;margin:0 auto;display:flex;flex-wrap:wrap;',
    'align-items:center;gap:.75rem 1.5rem}',
    '#cb p{flex:1;min-width:200px;margin:0}',
    '#cb .a{display:flex;gap:.6rem;flex-shrink:0;flex-wrap:wrap;align-items:center}',
    '#cb button{padding:.45rem 1rem;border:1px solid rgba(14,21,18,.4);background:transparent;',
    'color:var(--ink,#0E1512);font-family:Archivo,system-ui,sans-serif;font-size:.82rem;',
    'cursor:pointer;border-radius:2px;white-space:nowrap}',
    '#cb button:hover{background:rgba(14,21,18,.07)}',
    '#cb button:focus-visible{outline:2px solid var(--pen,#E2431C);outline-offset:2px}',
    '#cb a{color:var(--ok,#1F6E52)}',
  ].join('');
  document.head.appendChild(style);

  var banner = document.createElement('div');
  banner.id = 'cb';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', s.accept + ' / ' + s.reject);
  banner.innerHTML = '<div class="i"><p>' + s.text + ' <a href="' + s.privacyUrl + '">' + s.privacy + '</a></p>'
    + '<div class="a"><button id="cb-r">' + s.reject + '</button><button id="cb-a">' + s.accept + '</button></div></div>';
  document.body.appendChild(banner);

  function dismiss() { banner.remove(); style.remove(); }

  document.getElementById('cb-r').addEventListener('click', function () { writeConsent('denied'); dismiss(); });
  document.getElementById('cb-a').addEventListener('click', function () { writeConsent('granted'); loadGA(GA_ID); dismiss(); });
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); writeConsent('denied'); dismiss(); }
  });

  // Focus the reject button first (neutral default per GDPR)
  document.getElementById('cb-r').focus();
})();
