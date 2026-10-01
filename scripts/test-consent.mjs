/**
 * Playwright test suite for the consent banner + GA4 integration.
 *
 * The real GA_MEASUREMENT_ID is never set in files — this script intercepts the
 * compiled bundle and consent-banner.js on the wire and rewrites "G-XXXXXXXXXX"
 * to a test ID that only exists in this session. Outbound requests to
 * googletagmanager.com and google-analytics.com are intercepted and counted;
 * nothing ever leaves to Google.
 *
 * Serves dist/ with Netlify-like 404 semantics (unknown paths → 404.html, 404).
 *
 * Usage: node scripts/test-consent.mjs
 */

import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PORT = 4322;
const TEST_GA_ID = 'G-TEST000SIM'; // test-only, never written to any source file
const PLACEHOLDER_ID = 'G-XXXXXXXXXX'; // the sentinel the production code treats as "unset"

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
      let statusCode = 200;

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST, '404.html');
        statusCode = 404;
      }
      const ext = path.extname(filePath);
      res.writeHead(statusCode, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const results = [];
function check(name, pass, details) {
  results.push({ name, pass, details });
  const mark = pass ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${mark} ${name}${details ? ` — ${details}` : ''}`);
}

async function makeContext(browser, { injectId, gaRequests }) {
  // injectId: a GA ID to put on window.__GA_ID__ before any page script runs.
  //   TEST_GA_ID        → simulates a configured site; banner should render and GA should fire on accept
  //   PLACEHOLDER_ID    → simulates an unconfigured site; safety-net suppression must engage
  //   null              → use whatever ID is baked into the files (real production ID)
  const context = await browser.newContext();
  if (injectId) {
    await context.addInitScript((id) => { window.__GA_ID__ = id; }, injectId);
  }
  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('googletagmanager.com') || url.includes('google-analytics.com')) {
      gaRequests.push(url);
      return route.abort();
    }
    return route.continue();
  });
  return { context, page };
}

async function waitForMaybeBanner(page, ms = 1200) {
  // Give React or the vanilla JS banner time to mount
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

async function run() {
  console.log(`[test] serving dist/ on http://127.0.0.1:${PORT}`);
  const server = await startServer();
  const browser = await chromium.launch();

  try {
    console.log('\n[1] Placeholder ID (code as-is): no banner, no GA, no cookie');
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: PLACEHOLDER_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/`);
      await page.waitForSelector('h1');
      await waitForMaybeBanner(page);
      const banner = await page.$('[role="dialog"]');
      check('home / no banner when ID is placeholder', !banner);
      check('home / no outbound GA request', gaRequests.length === 0);
      const cookies = await context.cookies();
      check('home / no _ga cookie', !cookies.find((c) => c.name.startsWith('_ga')));
      await context.close();
    }
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: PLACEHOLDER_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/risorse/`);
      await page.waitForSelector('h1');
      await waitForMaybeBanner(page);
      const banner = await page.$('#cb, [role="dialog"]');
      check('/risorse/ (static) no banner when ID is placeholder', !banner);
      check('/risorse/ no outbound GA request', gaRequests.length === 0);
      await context.close();
    }

    console.log('\n[2] Test ID injected: banner visible on all 5 locales/sections');
    const PAGES = [
      { path: '/',               label: '/ (en, React)',          selector: '[role="dialog"]' },
      { path: '/it/',            label: '/it/ (React)',           selector: '[role="dialog"]' },
      { path: '/de/',            label: '/de/ (React)',           selector: '[role="dialog"]' },
      { path: '/risorse/',       label: '/risorse/ (vanilla)',    selector: '#cb' },
      { path: '/de/ressourcen/', label: '/de/ressourcen/ (vanilla)', selector: '#cb' },
    ];
    for (const p of PAGES) {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}${p.path}`);
      await page.waitForSelector('h1');
      await waitForMaybeBanner(page);
      const banner = await page.$(p.selector);
      check(`banner visible on ${p.label}`, !!banner);
      await context.close();
    }

    console.log('\n[3] Before any click: no GA request, no _ga cookie');
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/`);
      await page.waitForSelector('[role="dialog"]');
      await waitForMaybeBanner(page);
      check('no GA request before consent', gaRequests.length === 0);
      const cookies = await context.cookies();
      check('no _ga cookie before consent', !cookies.find((c) => c.name.startsWith('_ga')));
      await context.close();
    }

    console.log('\n[4] Accept → gtag.js is requested');
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/`);
      await page.waitForSelector('[role="dialog"]');
      const accept = page.locator('[role="dialog"] button').nth(1); // [reject, accept]
      await accept.click();
      await page.waitForTimeout(1500);
      const hitsGtag = gaRequests.some((u) => u.includes('googletagmanager.com'));
      check('React page: Accept triggers a request to googletagmanager.com', hitsGtag,
        `${gaRequests.length} intercepted — first: ${gaRequests[0] || 'none'}`);
      await context.close();
    }
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/risorse/`);
      await page.waitForSelector('#cb');
      await page.locator('#cb-a').click();
      await page.waitForTimeout(1500);
      const hitsGtag = gaRequests.some((u) => u.includes('googletagmanager.com'));
      check('/risorse/ (static): Accept triggers a request to googletagmanager.com', hitsGtag,
        `${gaRequests.length} intercepted`);
      await context.close();
    }

    console.log('\n[5] Decline → no GA request');
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/`);
      await page.waitForSelector('[role="dialog"]');
      const reject = page.locator('[role="dialog"] button').nth(0);
      await reject.click();
      await page.waitForTimeout(1500);
      check('React page: Decline keeps gaRequests empty', gaRequests.length === 0);
      await context.close();
    }
    {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}/risorse/`);
      await page.waitForSelector('#cb');
      await page.locator('#cb-r').click();
      await page.waitForTimeout(1500);
      check('/risorse/: Decline keeps gaRequests empty', gaRequests.length === 0);
      await context.close();
    }

    console.log('\n[6] 404.html still returns status 404');
    {
      const resp = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${PORT}/does-not-exist-xyz`, resolve).on('error', reject);
      });
      check('unknown URL returns 404', resp.statusCode === 404, `got ${resp.statusCode}`);
      // Drain response to let the connection close cleanly
      resp.resume();
    }
  } finally {
    await browser.close();
    server.close();
  }

  const pass = results.filter((r) => r.pass).length;
  console.log(`\n${pass === results.length ? '\x1b[32m' : '\x1b[31m'}${pass}/${results.length} checks passed\x1b[0m`);
  if (pass < results.length) process.exit(1);
}

run().catch((err) => {
  console.error('[test] fatal:', err);
  process.exit(1);
});
