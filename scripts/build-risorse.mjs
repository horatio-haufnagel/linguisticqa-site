/**
 * Post-build: genera le pagine statiche di /risorse/ da content/risorse/*.md.
 *
 * Perche' esiste: la sezione editoriale deve essere HTML puro, leggibile dai crawler
 * senza eseguire JavaScript e senza dipendere dal CDN di Tailwind. Per questo e'
 * separata da src/App.jsx (vedi DECISIONS.md, "Sezione /risorse/ come generatore statico").
 *
 * Comportamento:
 * - le pagine con "draft: true" nel frontmatter sono escluse, salvo INCLUDE_DRAFTS=1
 * - se non c'e' nessuna pagina pubblicata, non viene generato nulla (niente sezione vuota)
 * - aggiunge gli URL alla sitemap e genera llms.txt
 * - DIST_DIR permette di provare la build su una copia di dist/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content', 'risorse');
const SITE_URL = 'https://linguisticqa.com';
const INCLUDE_DRAFTS = process.env.INCLUDE_DRAFTS === '1';

const AUTHOR = {
  '@type': 'Person',
  name: 'Alessio Di Rubbo',
  url: `${SITE_URL}/it/`,
  sameAs: ['https://linkedin.com/in/alessiodirubbo'],
};

const TYPES = {
  glossario: 'Glossario',
  metodo: 'Metodologia',
  dati: 'Dati e rapporti',
  caso: 'Caso studio',
};

function fail(msg) {
  console.error(`[risorse] ERRORE: ${msg}`);
  process.exit(1);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const jsonLd = (obj) => JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fmtDate(iso) {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${iso}T12:00:00Z`)
  );
}

function stripMd(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFile(file) {
  const name = path.basename(file);
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) fail(`${name}: frontmatter mancante`);

  const meta = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i < 0) fail(`${name}: riga di frontmatter non valida: "${line}"`);
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }

  for (const k of ['title', 'description', 'type', 'published']) {
    if (!meta[k]) fail(`${name}: campo obbligatorio mancante: ${k}`);
  }
  if (!TYPES[meta.type]) fail(`${name}: type non valido "${meta.type}" (ammessi: ${Object.keys(TYPES).join(', ')})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.published)) fail(`${name}: published deve essere YYYY-MM-DD`);
  meta.modified = meta.modified || meta.published;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.modified)) fail(`${name}: modified deve essere YYYY-MM-DD`);
  meta.version = meta.version || '1.0';
  meta.slug = meta.slug || path.basename(file, '.md');
  if (!/^[a-z0-9-]+$/.test(meta.slug)) fail(`${name}: slug non valido "${meta.slug}"`);
  meta.draft = meta.draft === 'true';

  return { meta, body: m[2].trim() };
}

function renderBody(body) {
  const used = new Set();
  return marked.parse(body).replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    let id = slugify(decodeEntities(inner.replace(/<[^>]+>/g, '')));
    let n = 2;
    const base = id;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

function glossaryTerms(body, pageUrl) {
  return body
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [head, ...rest] = chunk.split('\n');
      const name = stripMd(head);
      const firstPara = rest.join('\n').trim().split(/\n\s*\n/)[0] || '';
      return {
        '@type': 'DefinedTerm',
        name,
        description: stripMd(firstPara),
        url: `${pageUrl}#${slugify(name)}`,
        inDefinedTermSet: pageUrl,
      };
    });
}

const CSS = `
:root{--paper:#E7EAE4;--ink:#0E1512;--ok:#1F6E52;--rule:rgba(14,21,18,.18);--muted:rgba(14,21,18,.68)}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:Archivo,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:1.0625rem;line-height:1.65}
a{color:var(--ok);text-underline-offset:.2em}
.wrap{max-width:46rem;margin:0 auto;padding:0 1.25rem}
.site{border-bottom:1px solid var(--rule)}
.site .wrap{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap;padding-top:1rem;padding-bottom:1rem}
.site a{text-decoration:none;font-weight:600;color:var(--ink)}
.site nav a{font-weight:400;margin-left:1.25rem;color:var(--ok)}
main{padding:2.5rem 0 3rem}
h1,h2,h3{font-family:"Bricolage Grotesque",Archivo,system-ui,sans-serif;font-weight:700;line-height:1.2}
h1{font-size:2.1rem;margin:0 0 .75rem}
h2{font-size:1.45rem;margin:2.25rem 0 .5rem}
h3{font-size:1.15rem;margin:1.75rem 0 .5rem}
.meta{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:.82rem;color:var(--muted);margin:0 0 2rem}
.lead{font-size:1.15rem;color:var(--muted);margin:0 0 1.5rem}
.cite{margin-top:3rem;padding:1rem 1.25rem;border:1px solid var(--rule);font-size:.95rem}
.cite strong{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em}
.cta{margin-top:2rem;font-size:.95rem}
ul.list{list-style:none;margin:0;padding:0}
ul.list li{padding:1rem 0;border-top:1px solid var(--rule)}
ul.list a{font-family:"Bricolage Grotesque",Archivo,system-ui,sans-serif;font-weight:700;font-size:1.2rem;text-decoration:none}
ul.list p{margin:.25rem 0 0}
footer{border-top:1px solid var(--rule);padding:1.25rem 0 2rem;font-size:.9rem;color:var(--muted)}
@media (max-width:30rem){h1{font-size:1.75rem}}
`;

function shell({ title, description, url, ogType, ld, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | linguisticqa.com</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="linguisticqa.com">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE_URL}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Bricolage+Grotesque:wght@700&family=IBM+Plex+Mono&display=swap">
<style>${CSS}</style>
<script type="application/ld+json">
${jsonLd(ld)}
</script>
</head>
<body>
<header class="site"><div class="wrap">
  <a href="${SITE_URL}/it/">Alessio Di Rubbo</a>
  <nav><a href="${SITE_URL}/it/">Servizi</a><a href="${SITE_URL}/risorse/">Risorse</a></nav>
</div></header>
<main><div class="wrap">
${bodyHtml}
</div></main>
<footer><div class="wrap">linguisticqa.com · Localizzazione, SEO e GEO in italiano per brand e agenzie DACH</div></footer>
</body>
</html>
`;
}

function articlePage({ meta, body }) {
  const url = `${SITE_URL}/risorse/${meta.slug}/`;
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.title,
      description: meta.description,
      inLanguage: 'it',
      datePublished: meta.published,
      dateModified: meta.modified,
      version: meta.version,
      image: `${SITE_URL}/og.jpg`,
      mainEntityOfPage: url,
      author: AUTHOR,
      publisher: AUTHOR,
    },
  ];
  if (meta.type === 'glossario') {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      name: meta.title,
      url,
      inLanguage: 'it',
      hasDefinedTerm: glossaryTerms(body, url),
    });
  }

  const bodyHtml = `<article>
<h1>${esc(meta.title)}</h1>
<p class="meta">${TYPES[meta.type]} · Versione ${esc(meta.version)} · Pubblicato il ${fmtDate(meta.published)} · Aggiornato il ${fmtDate(meta.modified)} · di Alessio Di Rubbo</p>
${renderBody(body)}
<div class="cite"><strong>Come citare questa pagina</strong><br>
Di Rubbo, Alessio. «${esc(meta.title)}». linguisticqa.com, versione ${esc(meta.version)}, aggiornata il ${fmtDate(meta.modified)}. <a href="${url}">${url}</a></div>
<p class="cta">Lavoro su localizzazione, SEO e GEO in italiano per brand e agenzie DACH. <a href="${SITE_URL}/it/">Vedi i servizi</a>.</p>
</article>`;

  return shell({
    title: meta.title,
    description: meta.description,
    url,
    ogType: 'article',
    ld: ld.length === 1 ? ld[0] : ld,
    bodyHtml,
  });
}

function indexPage(pages) {
  const url = `${SITE_URL}/risorse/`;
  const description =
    'Glossari, metodologie e dati sulla visibilità nelle risposte generate dall\'AI, in italiano. Ogni pagina ha versione, data e fonte citabile.';
  const groups = Object.keys(TYPES)
    .map((type) => {
      const items = pages.filter((p) => p.meta.type === type);
      if (!items.length) return '';
      return `<h2>${TYPES[type]}</h2>
<ul class="list">
${items
  .map(
    (p) => `<li><a href="${SITE_URL}/risorse/${p.meta.slug}/">${esc(p.meta.title)}</a>
<p>${esc(p.meta.description)}</p>
<p class="meta">Versione ${esc(p.meta.version)} · Aggiornato il ${fmtDate(p.meta.modified)}</p></li>`
  )
  .join('\n')}
</ul>`;
    })
    .join('\n');

  const bodyHtml = `<h1>Risorse</h1>
<p class="lead">${esc(description)}</p>
${groups}`;

  return shell({
    title: 'Risorse su GEO, SEO e qualità dell\'italiano',
    description,
    url,
    ogType: 'website',
    ld: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Risorse',
      url,
      inLanguage: 'it',
      author: AUTHOR,
      hasPart: pages.map((p) => ({
        '@type': 'Article',
        headline: p.meta.title,
        url: `${SITE_URL}/risorse/${p.meta.slug}/`,
      })),
    },
    bodyHtml,
  });
}

function updateSitemap(pages) {
  const file = path.join(DIST, 'sitemap.xml');
  if (!fs.existsSync(file)) fail(`sitemap.xml non trovata in ${DIST}`);
  let xml = fs.readFileSync(file, 'utf8');
  // idempotente: rimuove eventuali voci /risorse/ precedenti
  xml = xml.replace(/\s*<url>\s*<loc>https:\/\/linguisticqa\.com\/risorse\/[\s\S]*?<\/url>/g, '');
  const latest = pages.map((p) => p.meta.modified).sort().pop();
  const entries = [
    { loc: `${SITE_URL}/risorse/`, lastmod: latest },
    ...pages.map((p) => ({ loc: `${SITE_URL}/risorse/${p.meta.slug}/`, lastmod: p.meta.modified })),
  ];
  const block = entries
    .map((e) => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`)
    .join('\n');
  xml = xml.replace('</urlset>', `${block}\n</urlset>`);
  fs.writeFileSync(file, xml, 'utf8');
}

function writeLlmsTxt(pages) {
  const lines = [
    '# linguisticqa.com',
    '',
    '> Alessio Di Rubbo, Vienna. Localizzazione, SEO e GEO in italiano e Linguistic QA solo per l\'italiano, per brand e agenzie in Austria, Germania e Svizzera che vendono in Italia.',
    '',
    '## Pagine principali',
    '',
    `- [Servizi (italiano)](${SITE_URL}/it/): servizi, metodo ed esempi di audit`,
    '',
    '## Risorse',
    '',
    ...pages.map((p) => `- [${p.meta.title}](${SITE_URL}/risorse/${p.meta.slug}/): ${p.meta.description}`),
    '',
  ];
  fs.writeFileSync(path.join(DIST, 'llms.txt'), lines.join('\n'), 'utf8');
}

function main() {
  if (!fs.existsSync(DIST)) fail(`${DIST} non esiste: esegui prima vite build`);
  if (!fs.existsSync(CONTENT)) {
    console.log('[risorse] content/risorse/ assente, niente da generare.');
    return;
  }

  const all = fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseFile(path.join(CONTENT, f)));

  const slugs = new Set();
  for (const p of all) {
    if (slugs.has(p.meta.slug)) fail(`slug duplicato: ${p.meta.slug}`);
    slugs.add(p.meta.slug);
  }

  const pages = all
    .filter((p) => INCLUDE_DRAFTS || !p.meta.draft)
    .sort((a, b) => b.meta.published.localeCompare(a.meta.published));

  const skipped = all.length - pages.length;
  if (!pages.length) {
    console.log(`[risorse] nessuna pagina pubblicata (${skipped} bozze escluse): sezione non generata.`);
    return;
  }

  for (const p of pages) {
    const out = path.join(DIST, 'risorse', p.meta.slug, 'index.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, articlePage(p), 'utf8');
    console.log(`[risorse] ✓ risorse/${p.meta.slug}/${p.meta.draft ? ' (BOZZA)' : ''}`);
  }
  fs.writeFileSync(path.join(DIST, 'risorse', 'index.html'), indexPage(pages), 'utf8');
  console.log('[risorse] ✓ risorse/ (indice)');

  updateSitemap(pages);
  writeLlmsTxt(pages);
  console.log(`[risorse] sitemap e llms.txt aggiornati. Pagine: ${pages.length}, bozze escluse: ${skipped}.`);
}

main();
