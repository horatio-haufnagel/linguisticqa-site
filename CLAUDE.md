# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:3000 (no Netlify Functions)
npm run build     # production build → dist/
npm run preview   # preview built site
netlify dev       # local dev WITH Netlify Functions at http://localhost:8888
```

Note (2026-10-01): the evaluator function is NOT deployed. Its source lives in `tool-dev-wip/netlify/functions/evaluate-italian.js`, outside Netlify's default functions directory, and `src/App.jsx` does not call it. `netlify dev` is only needed if the function is moved back to `netlify/functions/`.

Requires a `.env` file in the repo root with `GEMINI_API_KEY=...` for local function testing.

Deploy: `git push origin main` triggers an automatic Netlify build (~12 seconds). **Never upload a ZIP to Hostinger/Netlify manually** — the next push will overwrite it silently.

## Architecture

Everything lives in these files:

- **`src/App.jsx`** (~1638 lines) — the entire app: all React components (defined as inline functions), all custom CSS (as a single `CSS` string injected via a `<style>` tag), all i18n content (the `T` object with `en`/`it`/`de` keys), and all configuration constants at the top.
- **`src/index.jsx`** — React entry point, minimal boilerplate.
- **`tool-dev-wip/netlify/functions/evaluate-italian.js`** (not deployed, see note above) — serverless function that calls the Gemini API (OpenAI-compatible endpoint) to evaluate Italian model output. Input: `POST { text: string }`. Output: `{ score, summary, errors[] }`.
- **`scripts/build-risorse.mjs`** + **`content/risorse/*.md`** — static generator for the /risorse/ section (see the dedicated section below).
- **`public/404.html`** — static 404 page served by Netlify for any unknown URL.

Tailwind is loaded from the CDN at runtime (`index.html`). There is no `tailwind.config.js`, no PostCSS build, and no compiled Tailwind CSS in `dist/`. `index.css` only contains Tailwind directives and a handful of global resets.

## Hard rules — do not break these

**Single-file discipline**: all components go in `src/App.jsx` as inline functions. Do not create a `components/` directory or any new `.jsx`/`.tsx` files.

**CSS**: all custom CSS goes into the `CSS` string constant in `src/App.jsx`. Do not create separate `.css` files beyond `index.css`.

**i18n**: every UI string goes into the `T` object in `src/App.jsx`. Always add all three languages (`en`, `it`, `de`) at the same time.

**Tailwind**: use only base utility classes. No arbitrary values (`[...]`), no custom classes, no `@apply`.

**Dependencies**: do not add npm packages without a documented reason.

## Design system

Active theme: `grottesca2`. Fonts: Bricolage Grotesque (display), Archivo (body), IBM Plex Mono (mono). Colors carry semantic meaning — they are not decorative:

| Token | Hex | Meaning |
|---|---|---|
| `--pen` | `#E2431C` | Error / critical flag (red) |
| `--mark` | `#EDE05F` | Under review / annotation (yellow) |
| `--ok` | `#1F6E52` | Resolved / CTA (green) |
| `--paper` | `#E7EAE4` | Background |
| `--ink` | `#0E1512` | Body text |

Adding any colour as decoration (rather than as a semantic signal) breaks the design intent.

## Key configuration constants (top of App.jsx)

`CALENDLY_URL`, `SITE_URL`, `PHOTO_SRC`, `LOGO_SRC`, `EMAIL`, `LINKEDIN` are defined at the top. `LOGO_SRC` is intentionally empty (no logo in header by design).

`THEME_ID` selects the active theme from `THEMES`. `HEADER_STYLE` and `BTN_STYLE` control header and CTA variants.

## Netlify Function — evaluate-italian.js (currently not deployed)

Calls Gemini via `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` with model `gemini-2.5-flash`. The system prompt is defined in `tool-dev/CONTEXT.md` (section 6). If JSON parsing of the response fails, retry once with an explicit instruction. `GEMINI_API_KEY` must be set in Netlify dashboard (production) and in `.env` (local).

## Infrastructure

- Hosting: Netlify (auto-deploy from `main`)
- DNS: Hostinger — nameservers stay on Hostinger (`solar/lunar.dns-parking.com`). The apex uses an ALIAS record pointing to `linguisticqa.netlify.app`; `www` does a 301 redirect to the apex. If the site stops updating, check the `server:` response header — it must say Netlify, not `hcdn`.
- No analytics, no cookie banner, no backend beyond Netlify Functions.

## Sezione /risorse/ (eccezione alle regole sopra)

Le pagine editoriali sono in `content/risorse/*.md` e vengono generate da `scripts/build-risorse.mjs` (ultimo passo di `npm run build`). Non vanno spostate in `App.jsx`. Per questa sezione sono ammessi: la dipendenza `marked`, CSS inline nel template dello script, testi in italiano (pagine tedesche solo come eccezione, con `lang: de`, pubblicate in `/de/ressourcen/`). Vedi `DECISIONS.md`, "Sezione /risorse/ come generatore statico". Frontmatter richiesto: `title`, `description`, `type` (glossario | metodo | dati | caso), `published` (YYYY-MM-DD); opzionali `modified`, `version`, `slug`, `draft: true`, `lang` (it | de), `translation` (slug della versione nell'altra lingua, per i link hreflang). Prova locale: `INCLUDE_DRAFTS=1 npm run build`.

## Known limitations

- Language routing via URL path (`/`, `/it/`, `/de/`) and post-build prerendering (`scripts/prerender.mjs`, Playwright) are in place since 2026-09-11: each locale gets its own static HTML with canonical and hreflang.
- No SPA catch-all redirect since 2026-10-01: unknown URLs return `404.html` with status 404. Adding a new client-side route requires a static file or an explicit redirect in `netlify.toml`.
- Node version for all Netlify contexts is set in `[build.environment]` (`NODE_VERSION = "22"`).
- Tailwind CDN dependency: if the CDN is unreachable, the site loses all styling.
- Accessibility: WCAG AA compliance has not been tested.

## Log dei Progressi - 2026-10-01

**Modifiche strutturali o al codice:** nessuna. In questa sessione non sono stati toccati `src/App.jsx`, la funzione Netlify, il design system né l'infrastruttura. L'unico file modificato nel repository è questo CLAUDE.md.

**Lavoro completato (solo testi su LinkedIn, in forma di bozza, non verificati come pubblicati):**
- Posizionamento ridefinito: localizzazione italiana, SEO e GEO per brand DACH e agenzie (anche in white-label). Linguistic QA resta come servizio, solo per l'italiano. RLHF/SFT esce dall'offerta.
- Titolo LinkedIn: proposte di tre varianti, tutte senza sede e con «Italian» esplicito davanti a Linguistic QA. Scelta finale non ancora confermata.
- Sezione About: riscritta sul nuovo posizionamento, senza nomi di clienti e con «extensive experience» al posto degli anni di SEO.
- Sezione Servizi: proposta di rimuovere Digital Marketing, SEM, Content Marketing e Writing, e di aggiungere Localization e Proofreading/Quality Assurance se presenti nell'elenco predefinito di LinkedIn.
- Descrizione dei servizi: versione finale da circa 470 caratteri, con l'italiano come unica lingua di arrivo.

**Punto aperto che riguarda il sito:** `src/App.jsx` e i contenuti `T` sono ancora posizionati su AI/NLP linguistic QA (RLHF, LLM evaluation). Non sono coerenti con il nuovo posizionamento. Nessuna modifica è stata fatta o decisa: prima va stabilito se il sito resta com'è o viene riposizionato, e fino ad allora il profilo LinkedIn rimanda a tradotext.com e non a questo sito.

## Log dei Progressi - 2026-10-01 (riposizionamento del sito)

**Modifiche:** `src/App.jsx` (oggetto `T` riscritto in EN/IT/DE, JSON-LD, nomi dei moduli, separatore della demo), `index.html` (meta, OG, JSON-LD, moduli Netlify nascosti), `public/og.jpg` (nuova immagine di anteprima).

- Posizionamento allineato al profilo LinkedIn: localizzazione in italiano, SEO e GEO in italiano, Linguistic QA solo per l'italiano, white-label per agenzie. RLHF/SFT, LLM evaluation e prompt localization rimossi.
- Servizi: 01 Localizzazione in italiano, 02 SEO e GEO in italiano, 03 Linguistic QA in italiano, piu il blocco «White-label per agenzie» al posto del retainer di monitoraggio.
- Demo e revisione di esempio riconvertite su testi e-commerce DE/EN→IT. I tre reperti Kaufland restano invariati.
- Moduli Netlify rinominati: `localization-brief`, `seo-geo-brief`, `linguistic-qa-brief`, `agency-brief`. I vecchi moduli restano nel pannello Netlify ma non ricevono piu richieste.
- Revisione gratuita: call Calendly di 30 minuti, pagina da inviare almeno tre giorni lavorativi prima.
- Tedesco: forma Sie, doppia forma per i nomi di persona («Kundinnen und Kunden»).
