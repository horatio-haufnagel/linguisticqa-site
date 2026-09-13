/**
 * Post-build prerendering: for each locale, load the built app in a headless
 * browser, wait for React to finish rendering, capture the live DOM, patch
 * canonical + hreflang, and write the result to dist/{locale}/index.html.
 *
 * Requires Fase 1 (detectLang reads window.location.pathname) to produce
 * correct per-locale content.
 */

import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://linguisticqa.com';
const PORT = 4321;

const LOCALES = [
  { lang: 'en', htmlLang: 'en', urlPath: '/',   distFile: 'index.html' },
  { lang: 'it', htmlLang: 'it', urlPath: '/it', distFile: 'it/index.html' },
  { lang: 'de', htmlLang: 'de', urlPath: '/de', distFile: 'de/index.html' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath !== '/' && urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1);

      let filePath = path.join(DIST, urlPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      // SPA fallback: anything without a matching file gets dist/index.html
      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.on('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function hreflangBlock() {
  return [
    `  <link rel="alternate" hreflang="en" href="${SITE_URL}/" />`,
    `  <link rel="alternate" hreflang="it" href="${SITE_URL}/it/" />`,
    `  <link rel="alternate" hreflang="de" href="${SITE_URL}/de/" />`,
    `  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`,
  ].join('\n');
}

function patchHtml(html, locale) {
  const canonicalUrl = locale.lang === 'en'
    ? `${SITE_URL}/`
    : `${SITE_URL}/${locale.lang}/`;

  // Fix <html lang>
  let out = html.replace(/<html([^>]*)\blang="[^"]*"/, `<html$1lang="${locale.htmlLang}"`);

  // Replace existing canonical
  if (out.includes('<link rel="canonical"')) {
    out = out.replace(
      /<link rel="canonical"[^>]*\/?>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    );
  } else {
    out = out.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  // Remove any existing hreflang alternates (may have been injected by a previous run)
  out = out.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*\/?>\n?/g, '');

  // Inject hreflang block right after canonical
  out = out.replace(
    /(<link rel="canonical"[^>]*\/>)/,
    `$1\n${hreflangBlock()}`
  );

  return out;
}

async function prerender() {
  console.log(`[prerender] serving dist/ on http://127.0.0.1:${PORT}`);
  const server = await startServer();

  const browser = await chromium.launch();

  try {
    for (const locale of LOCALES) {
      const url = `http://127.0.0.1:${PORT}${locale.urlPath}`;
      console.log(`[prerender] rendering ${url}`);

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'load' });
      // Wait for React to mount and render the hero
      await page.waitForSelector('h1', { timeout: 15000 });

      const html = await page.content();
      const patched = patchHtml(html, locale);

      const outPath = path.join(DIST, locale.distFile);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, patched, 'utf8');

      console.log(`[prerender] ✓ dist/${locale.distFile} (${patched.length} bytes)`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
    console.log('[prerender] done.');
  }
}

prerender().catch((err) => {
  console.error('[prerender] fatal:', err);
  process.exit(1);
});
