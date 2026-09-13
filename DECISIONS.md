# DECISIONS.md
Registro delle scelte progettuali e architetturali. Aggiorna questo file ogni volta che prendi una decisione importante.

---

## Hosting e DNS: Netlify con DNS centralizzato su Hostinger

**Data:** 2026-09-08
**Chi:** Alessio Di Rubbo
**Status:** ✅ Implementato

### Cosa è stato deciso?
Il sito linguisticqa.com usa Netlify per build e hosting, con deploy automatico da GitHub a ogni push su `main`. Il DNS resta su Hostinger, il registrar: un record ALIAS sull'apex punta a `linguisticqa.netlify.app`, invece di spostare i nameserver su Netlify.

### Perché?
Prima il sito era un progetto React compilato e caricato staticamente: ogni modifica richiedeva build locale, upload manuale dell'archivio, estrazione, attesa. L'obiettivo era eliminare quell'attrito con una pipeline di CI/CD reale, senza però spostare il controllo del dominio lontano dal registrar dove restano già email e altri servizi.

* Deploy automatico a ogni push, circa 12 secondi da commit a sito pubblicato
* Rollback a un deploy precedente in un clic, con log e commit visibili per ogni build
* Trade-off: due piattaforme da tenere sincronizzate invece di una sola. Se il record DNS dell'apex punta ancora alla vecchia infrastruttura, il dominio serve una copia vecchia del sito senza che nessun log di build lo segnali

### Alternative Considerate
* Hosting tradizionale Hostinger via SFTP: nessuna CI/CD nativa, gestione manuale delle credenziali, nessun deploy preview
* Spostare i nameserver su Netlify: avrebbe tolto flessibilità e allontanato la gestione DNS dal registrar dove restano email e altri servizi

### Implicazioni
* Per il codice: ogni modifica passa da commit e push su `main`, niente più upload manuale di archivi compilati
* Per performance: build Vite in `dist/`, ma senza una build PostCSS configurata; Tailwind gira ancora da CDN a runtime, un debito tecnico aperto
* Per manutenzione: chi tocca il DNS deve sapere che l'apex usa un record ALIAS (non A) verso Netlify, e che `www` fa un redirect 301 verso l'apex

### Reversibile?
⚠️ Parzialmente. Tornare a hosting tradizionale è possibile, ma richiede ricostruire la pipeline di build e ripristinare i record DNS uno per uno.

### Note
Se il sito smette di aggiornarsi, il primo controllo è l'header `server:` della risposta HTTP: deve indicare Netlify, non `hcdn` (la vecchia CDN Hostinger). I file del vecchio sito restano ancora su Hostinger, irraggiungibili dal dominio ma non cancellati: da ripulire quando c'è tempo.

---

## Posizionamento: sito monotematico AI/NLP QA

**Data:** 2026-09-08
**Chi:** Alessio Di Rubbo
**Status:** ✅ Deciso — implementazione da fare

### Cosa è stato deciso?
Il sito parla esclusivamente al segmento AI/NLP. Nessun blocco secondario "translation & localization generalista". I quattro servizi esposti sono:

- Italian Model Output Audit (+ Adversarial tier premium)
- Localization QA per prodotti in produzione
- Prompt Localization & Testing per l'italiano
- → Ongoing Monitoring Retainer (retention option, non servizio standalone)

### Perché?
L'obiettivo commerciale è passare da fornitore transazionale su piattaforme (Translated, Tolq) a consulente specializzato con retainer mensili (€900–1.500). Il ticket medio dei core service è €3.500. Un messaggio nitido attira il buyer giusto (team AI/NLP enterprise) e segnala chiaramente la fascia di prezzo. Aggiungere un blocco secondario generalista diluisce il segnale e rischia di attrarre clienti nel bucket sbagliato ($8–65/ora, Meridial/Toloka tier).

### Alternative considerate
- Core AI/NLP + blocco secondario "Also available: translation & localization": avrebbe protetto il flusso di revenue da clienti tipo Kaufland, ma a costo di incoerenza nel posizionamento.

### Implicazioni
- La sezione servizi di `App.jsx` va riscritta con i quattro servizi sopra (EN/IT/DE)
- Il pricing va esposto sul sito secondo le schede del documento strategico
- I profili freelance generalisti esistenti (fuori da questo workspace) non vanno usati come fonte per il sito

### Note
Chi torna sul sito cercando "traduzione e localizzazione generalista" non trova più quel servizio. Questa è una scelta, non un errore.

---

## Design Philosophy: Technical Report Aesthetic invece di SaaS UI

**Data:** 2026-09-08
**Chi:** Alessio Di Rubbo
**Status:** ✅ Implementato

### Cosa è stato deciso?
Il sito usa un'estetica "technical report" (IBM Plex Sans/Mono, sfondo carta caldo, colore riservato SOLO alle annotazioni di errore) invece del look generico SaaS/freelancer (gradienti, card hover effects, troppi accent color).

### Perché?
Clienti strategici come Amazon, NVIDIA e Stellantis cercano credibilità tecnica, non design "cool". Un sito che copia l'estetica SaaS (Figma-style, minimalismo generico) perde autorità agli occhi di un buyer tecnico. Un designer che vende design è il cliente sbagliato; un esperto di QA che mostra il problema prima della soluzione attrae i buyer giusti.

* Differenziazione dai freelancer che copiano template Webflow
* Segnala competenza linguistica e tecnica prima dell'estetica
* Attrae buyer strategici, respinge il lavoro a volume da tire-kicker
* Rosso e giallo funzionano come payload semantico (errore/revisione), non come decorazione
* Trade-off: il sito non "colpisce" al primo scroll, per scelta. Richiede un visitatore che legga, non che scorra in tre secondi

### Alternative Considerate
* SaaS-style (card, gradienti, hover morbidi): avrebbe confuso il posizionamento (designer? copywriter? linguista?) agli occhi del pubblico giusto
* Minimalismo brutalista (bianco puro, font di sistema): avrebbe perso la personalità Vienna-based e la credibilità tecnica

### Implicazioni
* Per il branding: ogni colore aggiunto deve avere una funzione, non essere decorazione
* Per la copy: deve fare il lavoro pesante visivamente, il design non cattura l'attenzione da solo
* Per manutenzione: chi tocca il sito in futuro deve capire che il rosso non è un accent color, è un flag di errore
* Per il pitch: il sito è uno strumento di posizionamento, non un portfolio di design skills

### Reversibile?
⚠️ Parzialmente. Ricolorare in Tailwind è facile, circa 15 minuti. Difficile è il messaging: passare a un look SaaS comunica "ora sono un designer generalista", il che contraddice il positioning attuale.

### Note
Segnali da monitorare:
* Un prospect visita il sito e pensa "semplice uguale meno esperto": il messaging sulla landing non regge
* Un prospect è catturato da rosso/giallo come elemento decorativo, non semantico: va ricalibrata l'aspettativa in discovery call
* Il primo cliente che chiede "perché non un design più moderno": ricordare che moderno non equivale a credibile in questo contesto

Se aggiungi sezioni future:
* Ogni sezione deve aggiungere informazione, non estetica
* Niente animazioni ornamentali; ogni movimento deve guidare lo sguardo su una decisione (CTA, error flag)
* La tabella di audit deve restare al centro dell'attenzione, senza competere con il design

---

## Playwright come devDependency per il prerendering per lingua

**Data:** 2026-09-11
**Chi:** Alessio Di Rubbo
**Status:** ✅ Implementato

### Cosa è stato deciso?
Eccezione alla regola "nessuna nuova dipendenza npm salvo casi critici": `playwright` aggiunto come devDependency, usato esclusivamente in `scripts/prerender.mjs`, eseguito durante `npm run build`. Mai incluso nel bundle runtime servito al browser.

### Perché?
Un crawler che non esegue JS vede solo `<div id="root"></div>`. Playwright avvia Chromium in modalità headless, carica il sito già buildato su un server locale, aspetta il render completo e cattura l'HTML risultante per ciascuna lingua (`en`, `it`, `de`). Questo HTML viene scritto su `dist/index.html`, `dist/it/index.html`, `dist/de/index.html`, rendendoli indicizzabili senza JS.

Non esiste alternativa zero-dependency praticabile: SSR richiederebbe di riscrivere l'app da zero, `jsdom` non esegue React completo con effetti e interazioni, html-snapshots senza browser headless non reggono la complessità del rendering.

### Alternative Considerate
* SSR con framework (Next.js, Remix): richiederebbe riscrivere tutta l'app, non è una "dipendenza", è un cambio architetturale completo
* `jsdom` + rendering manuale: non esegue React hooks e side effect, produce HTML incompleto
* Nessun prerendering: lascia il sito non indicizzabile per le versioni `/it` e `/de`

### Implicazioni
* `npx playwright install chromium` va eseguito una tantum dopo `npm install` (scarica il browser headless, ~130MB)
* Il tempo di build aumenta di circa 15–30 secondi per il render headless delle tre lingue
* In ambienti CI (Netlify) Chromium non è presente di default: il primo deploy preview è fallito con "Executable doesn't exist at /opt/buildhome/.cache/ms-playwright/...". Risolto aggiungendo `"postinstall": "playwright install --with-deps chromium"` in package.json, così il browser viene scaricato automaticamente dopo ogni `npm install`, sia in locale che su Netlify

### Reversibile?
✅ Sì. Rimuovere `playwright` da devDependencies, eliminare `scripts/prerender.mjs`, ripristinare `"build": "vite build"` in package.json. Le sottocartelle `dist/it/` e `dist/de/` tornano a non esistere.
