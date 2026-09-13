# linguisticqa-site — Tool Development Context
# Da salvare in: linguisticqa-site/tool-dev/CONTEXT.md

**Ultimo aggiornamento:** 9 settembre 2026
**Repo:** github.com/horatio-haufnagel/linguisticqa-site
**Sito live:** linguisticqa.com
**Deploy:** Netlify (progetto `linguisticqa`) — auto-deploy da push GitHub

---

## 1. Stack tecnico

- **Framework:** React 18 + Vite 5
- **Entry point:** `src/App.jsx` — SPA single-file, ~1600 righe (tutto: layout, CSS, i18n, componenti)
- **Styling:** Tailwind via CDN runtime (`cdn.tailwindcss.com` in `index.html`)
  - Nessun `tailwind.config.js`, nessun PostCSS, nessun CSS compilato
  - Solo classi core utility: NO arbitrary values `[...]`, NO classi custom
- **Font:** caricati da Google Fonts dentro `src/App.jsx` (non in `index.html`)
- **Minificazione:** terser (in `vite.config.js`)
- **Nessun router**, nessun analytics, nessun backend

---

## 2. Regole architetturali — NON DEROGARE

### Componenti React
- Tutto il codice dei componenti va in `src/App.jsx` come funzioni React inline
- NON creare file di componenti separati (`components/`, `ui/`, etc.)
- NON creare subdirectory per la UI

### CSS
- Tutto il CSS custom va nella stringa CSS esistente in `src/App.jsx`
- NON creare file `.css` separati
- Tailwind CDN: solo classi base, no arbitrary values

### i18n
- Tutte le stringhe UI vanno nell'oggetto `T` in `src/App.jsx`:
```javascript
const T = {
  en: { chiave: "testo" },
  it: { chiave: "testo" },
  de: { chiave: "testo" },
};
```
- Aggiungere sempre tutte e tre le lingue

### Dipendenze npm
- NON aggiungere pacchetti nuovi salvo casi critici documentati

---

## 3. Design system

| Token | Valore |
|---|---|
| Sfondo carta | `#E7EAE4` |
| Testo inchiostro | `#0E1512` |
| Errore / Critico | `#E2431C` (rosso) |
| Medio / In revisione | `#EDE05F` (giallo — usa testo scuro sopra) |
| CTA / Successo / Risolto | `#1F6E52` (verde) |
| Font display | Bricolage Grotesque 700 |
| Font body | Archivo |
| Font mono | IBM Plex Mono |

---

## 4. Netlify Functions

### Struttura
```
linguisticqa-site/
├── src/App.jsx
├── netlify/
│   └── functions/
│       └── evaluate-italian.js     ← Tool 1
├── netlify.toml
└── package.json
```

### netlify.toml — sezione functions obbligatoria
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 3000

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { NODE_VERSION = "18" }
```

### Runtime
- Node.js 18 (fetch nativo disponibile — NON usare `require("node-fetch")`)
- Timeout max consigliato: 15 secondi

### Variabili d'ambiente
| Key | Dove | Nota |
|---|---|---|
| `GEMINI_API_KEY` | Netlify dashboard → Site configuration → Environment variables | Mai hardcoded, mai committare |

In locale: file `.env` nella root del repo (verificare che sia in `.gitignore`).

---

## 5. API — Google AI Studio (Gemini)

**Endpoint OpenAI-compatible:**
```
https://generativelanguage.googleapis.com/v1beta/openai
```

**Call pattern (nella Netlify Function):**
```javascript
const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",  // fallback: "gemini-2.0-flash"
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      max_tokens: 1000,
    }),
  }
);
```

**Perché Gemini e non Claude API:**
Free tier via Google AI Studio, nessuna carta di credito, response-schema JSON nativo,
competenza italiana documentata, 15 RPM / 1.500 RPD (sufficiente per 50–200 call/giorno).

---

## 6. Tool 1 — Italian Model Output Evaluator

### Scopo
Analisi linguistica di output AI in italiano: identifica errori di qualità prima che
li trovino gli utenti finali. Dimostrazione live del servizio principale.

### Netlify Function: `netlify/functions/evaluate-italian.js`

**Input:** POST con body `{ text: string }` — validare: non vuoto, max 2000 caratteri.

**System prompt da usare (letterale):**
```
Sei un esperto di linguistica italiana specializzato nella valutazione di output
di modelli AI. Analizza il testo fornito e identifica problemi linguistici.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido, senza markdown, senza backtick,
senza testo prima o dopo. Formato esatto:

{
  "score": <numero intero 0-100, qualità complessiva>,
  "summary": "<frase breve in italiano che riassume il giudizio complessivo>",
  "errors": [
    {
      "categoria": "<una di: concordanza | registro | calco | sintassi | terminologia | fluency>",
      "severita": "<una di: critico | medio | minore>",
      "frammento": "<testo originale problematico, max 60 caratteri>",
      "spiegazione": "<perché è un problema, max 120 caratteri>",
      "suggerimento": "<riscrittura corretta o migliorata>"
    }
  ]
}

Se il testo non ha errori rilevanti, restituisci errors come array vuoto e score alto (85-100).
Analizza per: concordanza genere/numero, registro incoerente (tu/lei/voi misto),
calchi dall'inglese o costruzioni non idiomatiche, problemi sintattici,
terminologia inconsistente, fluency e naturalezza generale.
```

**Gestione errori JSON:** se il parsing fallisce, ritentare una volta aggiungendo
l'istruzione "Rispondi solo con JSON puro, nessun testo aggiuntivo".

**Output verso client:** `{ score, summary, errors }` oppure `{ error: "messaggio" }`.

### Componente React: `ItalianOutputEvaluator`

Da aggiungere in `src/App.jsx` come funzione inline. UI:
- Textarea (max 2000 caratteri) con contatore live
- Pulsante "Analizza" — chiama `/.netlify/functions/evaluate-italian`
- Loading state
- Score badge colorato: verde ≥80, giallo 60–79, rosso <60
- Summary in testo
- Card per ogni errore con: badge categoria, badge severità colorato, frammento in monospace, spiegazione, suggerimento
- Se `errors` è array vuoto: messaggio positivo
- CTA box con bordo `#1F6E52`:
  - Testo: "Questo è un assaggio di quello che faccio per i team AI su scala più ampia."
  - Link: "Prenota una call gratuita →" → `https://calendly.com/d/d2nc-6w9-njv`

Sezione con `id="tool-evaluator"` per link diretti.

---

## 7. Social proof e CTA

**Clienti verificabili da citare quando pertinente:**
Amazon, NVIDIA, Swarovski, Stellantis, Kaufland, Manor AG

**Calendly:** `https://calendly.com/d/d2nc-6w9-njv` (call 30 min)

---

## 8. Test in locale

```bash
# Creare .env nella root con:
GEMINI_API_KEY=sk-...

# Avviare
netlify dev

# Function disponibile su:
http://localhost:8888/.netlify/functions/evaluate-italian
```

---

## 9. Workflow deploy

Locale → git commit → git push → GitHub → Netlify auto-rebuild (~12 secondi) → live.
NON serve trigger manuale su Netlify.

---

## 10. Checklist prima del push

- [ ] `netlify.toml` ha la sezione `[functions]`
- [ ] `GEMINI_API_KEY` impostata su Netlify dashboard
- [ ] `.env` in `.gitignore`
- [ ] Nessuna API key hardcoded nel codice
- [ ] Tutte le stringhe UI nell'oggetto `T` (EN/IT/DE)
- [ ] Tutto il CSS nella stringa CSS di `src/App.jsx`
- [ ] Testato con `netlify dev` prima del push
