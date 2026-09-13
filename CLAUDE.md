# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:3000 (no Netlify Functions)
npm run build     # production build → dist/
npm run preview   # preview built site
netlify dev       # local dev WITH Netlify Functions at http://localhost:8888
```

Use `netlify dev` (not `npm run dev`) when working on or testing `netlify/functions/evaluate-italian.js`. The function becomes available at `http://localhost:8888/.netlify/functions/evaluate-italian`.

Requires a `.env` file in the repo root with `GEMINI_API_KEY=...` for local function testing.

Deploy: `git push origin main` triggers an automatic Netlify build (~12 seconds). **Never upload a ZIP to Hostinger/Netlify manually** — the next push will overwrite it silently.

## Architecture

Everything lives in three files:

- **`src/App.jsx`** (~1638 lines) — the entire app: all React components (defined as inline functions), all custom CSS (as a single `CSS` string injected via a `<style>` tag), all i18n content (the `T` object with `en`/`it`/`de` keys), and all configuration constants at the top.
- **`src/index.jsx`** — React entry point, minimal boilerplate.
- **`netlify/functions/evaluate-italian.js`** — serverless function that calls the Gemini API (OpenAI-compatible endpoint) to evaluate Italian model output. Input: `POST { text: string }`. Output: `{ score, summary, errors[] }`.

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

## Netlify Function — evaluate-italian.js

Calls Gemini via `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` with model `gemini-2.5-flash`. The system prompt is defined in `tool-dev/CONTEXT.md` (section 6). If JSON parsing of the response fails, retry once with an explicit instruction. `GEMINI_API_KEY` must be set in Netlify dashboard (production) and in `.env` (local).

## Infrastructure

- Hosting: Netlify (auto-deploy from `main`)
- DNS: Hostinger — nameservers stay on Hostinger (`solar/lunar.dns-parking.com`). The apex uses an ALIAS record pointing to `linguisticqa.netlify.app`; `www` does a 301 redirect to the apex. If the site stops updating, check the `server:` response header — it must say Netlify, not `hcdn`.
- No analytics, no cookie banner, no backend beyond Netlify Functions.

## Known limitations

- All three languages share one URL. No `hreflang` tags and no `/it/` or `/de/` paths — search engines index only the EN version.
- Tailwind CDN dependency: if the CDN is unreachable, the site loses all styling.
- Accessibility: WCAG AA compliance has not been tested.
