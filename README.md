# Linguistic QA — Landing Page

Sito React multilingue (EN/IT/DE) per Alessio Di Rubbo, Linguistic QA Specialist.

## Setup locale

```bash
npm install
npm run dev
```

Apri http://localhost:3000

## Build per produzione

```bash
npm run build
```

Output in `dist/`

## Deploy su Netlify

1. Push a GitHub
2. Netlify ricostruisce automaticamente
3. Ogni push = deploy istantaneo

## TODO prima del primo push

- [ ] CALENDLY_URL in App.jsx
- [ ] PHOTO_SRC in App.jsx (headshot file)
- [ ] LOGO_SRC in App.jsx (logo file, opzionale)
- [ ] SITE_URL → https://www.linguisticqa.com
- [ ] Aggiungere screenshot/assets in `public/`

## Font & Design

- IBM Plex Sans/Mono (core)
- Tailwind CSS (styling)
- Tema: technical report, pen red + highlighter yellow per errori/correzioni
- Vedi App.jsx per gestione colori e variabili CSS

## Struttura

```
linguisticqa-site/
├── src/
│   ├── App.jsx          (componente principale React)
│   ├── index.jsx        (entry point)
├── public/
│   ├── index.html       (HTML entry point)
│   └── [assets]         (immagini, file statici)
├── index.css            (Tailwind + global CSS)
├── vite.config.js       (Vite build config)
├── netlify.toml         (Netlify deploy config)
├── package.json         (dipendenze + script)
└── README.md
```
