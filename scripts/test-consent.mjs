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

    // ========================================================================
    // Cookie-settings footer link on every page
    // ========================================================================
    const COOKIE_LABEL = {
      '/':                 'Cookie settings',
      '/it/':              'Impostazioni cookie',
      '/de/':              'Cookie-Einstellungen',
      '/risorse/':         'Impostazioni cookie',
      '/de/ressourcen/':   'Cookie-Einstellungen',
      '/privacy/':         'Cookie settings',
      '/it/privacy/':      'Impostazioni cookie',
      '/de/datenschutz/':  'Cookie-Einstellungen',
      '/impressum/':       'Cookie-Einstellungen',
    };

    console.log('\n[7] Cookie settings link visible with correct localised label');
    for (const [path, label] of Object.entries(COOKIE_LABEL)) {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}${path}`);
      await page.waitForSelector('h1');
      await page.waitForTimeout(500);
      const el = page.locator(`footer >> text="${label}"`).first();
      const count = await el.count();
      const visible = count > 0 ? await el.isVisible().catch(() => false) : false;
      check(`${path}: footer has "${label}"`, visible, count === 0 ? 'element not found' : '');
      await context.close();
    }

    console.log('\n[8] Click Cookie settings reopens the banner');
    for (const [path, label] of Object.entries(COOKIE_LABEL)) {
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}${path}`);
      await page.waitForSelector('h1');
      // Dismiss the initial banner by clicking Reject
      await page.waitForSelector('[role="dialog"], #cb', { timeout: 10000 });
      const rejectBtn = page.locator('[role="dialog"] button, #cb button').nth(0);
      await rejectBtn.click();
      await page.waitForTimeout(500);
      // Click the Cookie settings footer control
      const link = page.locator(`footer >> text="${label}"`).first();
      await link.click({ force: true });
      // Banner must reappear
      try {
        await page.waitForSelector('[role="dialog"], #cb', { timeout: 5000 });
        check(`${path}: click on "${label}" reopens the banner`, true);
      } catch (_) {
        check(`${path}: click on "${label}" reopens the banner`, false, 'no dialog after click');
      }
      await context.close();
    }

    console.log('\n[9] Accept → Reject via Cookie settings removes every _ga* cookie');
    // Covers both the React side and the vanilla side. Synthetic cookies are injected
    // after Accept so the revocation pattern is exercised deterministically even on
    // 127.0.0.1 where gtag.js may not persist cookies.
    const REVOKE_PAGES = ['/', '/it/', '/de/', '/risorse/', '/de/ressourcen/',
                          '/privacy/', '/it/privacy/', '/de/datenschutz/', '/impressum/'];
    for (const path of REVOKE_PAGES) {
      const label = COOKIE_LABEL[path];
      const gaRequests = [];
      const { context, page } = await makeContext(browser, { injectId: TEST_GA_ID, gaRequests });
      await page.goto(`http://127.0.0.1:${PORT}${path}`);
      await page.waitForSelector('[role="dialog"], #cb', { timeout: 10000 });
      // Accept
      const acceptBtn = page.locator('[role="dialog"] button, #cb button').nth(1);
      await acceptBtn.click();
      await page.waitForTimeout(1500);
      // Inject synthetic GA cookies that revokeGA must find and clear
      await page.evaluate(() => {
        document.cookie = '_ga=GA1.1.synthetic.0; path=/';
        document.cookie = '_ga_TEST000SIM=GS1.1.synthetic; path=/';
        document.cookie = '_gid=GA1.1.synthetic; path=/';
      });
      let cookies = await context.cookies();
      const before = cookies.map((c) => c.name).filter((n) => /^_ga(_.+)?$|^_gid$|^_gat$/.test(n));
      if (before.length === 0) {
        check(`${path}: synthetic _ga* cookies were set before revoke`, false,
          'injection failed (precondition)');
        await context.close();
        continue;
      }
      // Reopen the banner via the footer link
      const link = page.locator(`footer >> text="${label}"`).first();
      await link.click({ force: true });
      await page.waitForSelector('[role="dialog"], #cb', { timeout: 5000 });
      // Reject in the reopened banner
      await page.locator('[role="dialog"] button, #cb button').nth(0).click();
      await page.waitForTimeout(1000);
      cookies = await context.cookies();
      const after = cookies.map((c) => c.name).filter((n) => /^_ga(_.+)?$|^_gid$|^_gat$/.test(n));
      check(`${path}: all _ga*/_gid/_gat cookies removed after Reject`, after.length === 0,
        after.length ? `remaining: ${after.join(',')} (had: ${before.join(',')})` : `cleared ${before.length}`);
      await context.close();
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
