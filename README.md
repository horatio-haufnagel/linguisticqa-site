# Linguistic QA — Landing page

Sito React multilingue (EN/IT/DE) per Alessio Di Rubbo, Linguistic QA Specialist.
Produzione: https://linguisticqa.com

## Stack reale

- React 18 + Vite 5, build minificato con `terser` (vedi `vite.config.js`)
- **Tailwind è caricato dalla CDN a runtime** (`cdn.tailwindcss.com` in `index.html`).
  Non esiste una build PostCSS/Tailwind: il CSS compilato in `dist/` è ~110 byte e
  contiene solo le regole di `index.css`. Se un giorno la CDN non risponde, il sito
  perde tutto lo stile.
- Font caricati da Google Fonts **dentro `src/App.jsx`**, non da `index.html`:
  Bricolage Grotesque (display), Archivo (body), IBM Plex Mono / Sans (mono e UI)

## Setup locale

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # output in dist/
```

## Multilingua

Tre lingue (EN/IT/DE) in un unico `src/App.jsx`. La scelta dell'utente viene
salvata in `localStorage`.

**Limite noto:** le tre lingue vivono tutte sullo stesso URL. Non esistono
percorsi `/it/` e `/de/` e non ci sono tag `hreflang`, quindi i motori di ricerca
indicizzano di fatto solo la versione EN. Da affrontare solo se si decide di
puntare sulla ricerca organica in tedesco o italiano.

## Deploy

Repository collegato a Netlify l'8 settembre 2026. Da quel momento:

```
git push origin main  ->  Netlify build  ->  linguisticqa.com
```

- Build command: `npm run build`
- Publish directory: `dist`
- Branch di produzione: `main`

Prima del collegamento i deploy venivano caricati a mano come ZIP via API, e il
repo era rimasto indietro rispetto a quello che era online. Non tornare a quel
metodo: se carichi uno ZIP a mano, il push successivo lo sovrascrive.

## Dominio e DNS

- Dominio: `linguisticqa.com`, primario su Netlify, certificato Let's Encrypt
- **DNS gestito su Hostinger**, non su Netlify. I nameserver sono ancora
  `solar/lunar.dns-parking.com`. Funziona (record ALIAS sulla root, CNAME su www)
  e non c'e motivo di cambiarlo, ma la documentazione precedente diceva
  erroneamente che i nameserver erano passati a Netlify.

## Aperto / non fatto

- [ ] `LOGO_SRC` in `App.jsx` e vuoto: nessun logo in header (scelta, non bug)
- [ ] Nessun test di accessibilita eseguito. Il documento di lancio dichiarava
      "WCAG AA verificato": non e vero, non e mai stato testato
- [ ] Niente URL localizzati ne `hreflang` (vedi sezione Multilingua)
- [ ] I file del vecchio sito sono ancora sullo spazio Hostinger, irraggiungibili
      dal dominio ma non cancellati

## Struttura

```
linguisticqa-site/
├── index.html          entry point HTML (ROOT del progetto, non in public/)
├── index.css           direttive Tailwind + CSS globale
├── src/
│   ├── App.jsx         componente unico: layout, contenuti, i18n EN/IT/DE
│   └── index.jsx       entry point React
├── public/
│   ├── alessio.jpg     foto profilo 900x900
│   └── og.jpg          anteprima social 1200x630
├── vite.config.js
├── netlify.toml
└── package.json
```
