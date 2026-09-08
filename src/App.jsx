import { useState, useEffect, useMemo } from "react";

/* =========================================================================
   Alessio Di Rubbo — Linguistic QA for AI teams
   Single-file React app. EN / IT / DE. Tailwind compiled at build time.
   Visual rules: see DESIGN.md. The only decorative device is the reviewer's pen.
   -------------------------------------------------------------------------
   TODO BEFORE DEPLOY (search for "TODO:"):
     - CALENDLY_URL  → your Calendly / Cal.com event link
     - SITE_URL      → canonical URL (OG tags + JSON-LD)
     - PHOTO_SRC     → headshot, square, ≥800px (public/alessio.jpg)
     - AUDIT rows    → replace with anonymised rows from a real audit
     - NOTES         → review the three notes; they are drafts in your voice
   No analytics on purpose: no cookie banner. Count Calendly bookings instead.
   ========================================================================= */

const CALENDLY_URL = ""; // TODO
const SITE_URL = "https://tradotext.com"; // TODO: confirm canonical domain
const PHOTO_SRC = "";    // TODO: e.g. "/alessio.jpg"
const LOGO_SRC  = "";    // TODO: header logo, e.g. "/logo.svg" (SVG or 2x PNG, ~28px tall).
                         // Empty = no mark; the navigation moves left to keep the bar balanced.
const EMAIL = "alessio.drb@gmail.com";
const LINKEDIN = "https://linkedin.com/in/alessiodirubbo";


/* ---------- theme (font + palette). Switch THEME_ID to compare. ---------- */
const THEMES = {
  plex: {
    fonts: "family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500",
    vars: "--paper:#FBFAF7; --ink:#141414; --ink-2:#5C5C5C; --rule:#E3E1DA; --pen:#C8321B; --mark:#FFF1A8; --mark-on:#FFE66B; --ok:#1F6E52; --sans:'IBM Plex Sans',system-ui,sans-serif; --display:'IBM Plex Sans',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace; --h1w:500; --h1ls:-0.01em;",
  },
  manoscritto: {
    fonts: "family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Courier+Prime:wght@400;700",
    vars: "--paper:#F4EFE6; --ink:#1F1B17; --ink-2:#6B6259; --rule:#DCD3C4; --pen:#B8321A; --mark:#F6E39A; --mark-on:#F2D96A; --ok:#2E6B4E; --sans:'Newsreader',Georgia,serif; --display:'Newsreader',Georgia,serif; --mono:'Courier Prime',ui-monospace,monospace; --h1w:500; --h1ls:-0.015em;",
  },
  grottesca: {
    fonts: "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600&family=Archivo:wght@400;500&family=IBM+Plex+Mono:wght@400;500",
    vars: "--paper:#EEF0EC; --ink:#131B17; --ink-2:#55605A; --rule:#D3D8D2; --pen:#D63F1E; --mark:#F0E67E; --mark-on:#E8DA55; --ok:#1F6E52; --sans:'Archivo',system-ui,sans-serif; --display:'Bricolage Grotesque',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace; --h1w:600; --h1ls:-0.02em;",
  },
  /* Same family, pushed: darker ground, display used everywhere it can be, mono as a structural label. */
  grottesca2: {
    fonts: "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Archivo:wght@400;500&family=IBM+Plex+Mono:wght@400;500",
    vars: "--paper:#E7EAE4; --ink:#0E1512; --ink-2:#4C5852; --rule:#C9D0C8; --pen:#E2431C; --mark:#EDE05F; --mark-on:#E3D42E; --ok:#1F6E52; --sans:'Archivo',system-ui,sans-serif; --display:'Bricolage Grotesque',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace; --h1w:700; --h1ls:-0.035em;",
  },
  bodoni: {
    fonts: "family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Karla:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500",
    vars: "--paper:#F2EFE6; --ink:#14342B; --ink-2:#5B6A62; --rule:#D8D4C6; --pen:#C2402A; --mark:#F5E27A; --mark-on:#EFD54F; --ok:#14342B; --sans:'Karla',system-ui,sans-serif; --display:'Bodoni Moda',Georgia,serif; --mono:'IBM Plex Mono',ui-monospace,monospace; --h1w:500; --h1ls:0;",
  },
};
const THEME_ID = "grottesca2";
const HEADER_STYLE = "paper"; // dark | paper | inline | minimal
const BTN_STYLE = "kgreen"; // highlighter in "resolved" green — see DESIGN.md // block | rule | bracket | tab | mark | arrow
const THEME = THEMES[THEME_ID];
const HERO_LAYOUT = "wide"; // "columns" | "wide"
const LANGS = ["en", "it", "de"];
const STORAGE_KEY = "adr_lang";

/* ---------- i18n ---------------------------------------------------------- */
const T = {
  en: {
    htmlLang: "en",
    metaTitle: "Alessio Di Rubbo — Linguistic QA for AI teams (Italian)",
    metaDesc: "Error analysis for Italian model output. I find where your model gets Italian wrong before your users do: audits, evaluation data, launch QA.",
    nav: { audit: "Sample audit", findings: "Findings", notes: "Notes", about: "About", cta: "Book a free audit", menu: "Menu" },
    eyebrow: { audit: "audit", findings: "findings", notes: "notes", process: "process", about: "about" },
    hero: {
      h1a: "Your model speaks Italian.",
      h1b: "I find where it gets it ",
      h1mark: "wrong",
      h1c: ".",
      sub: "Error analysis for Italian output, done by a linguist who has trained the models you're evaluating against. You send strings; you get a taxonomy, severities, root causes and fixes.",
      cta: "Book a free audit",
      secondary: "See a sample audit",
      note: "Vienna. Remote, with teams in DACH, Italy and the US.",
      creds: ["MA in Applied Linguistics, University of Vienna", "RLHF and SFT on production translation models (Translated, ModernMT)", "Italian output validated for Amazon, NVIDIA, Stellantis, Kaufland", "Vienna · remote · EN, DE, IT"],
    },
    demo: {
      title: "One string. Three problems your metrics won't see.",
      source: "Source · EN",
      output: "Model output · IT",
      src: "Are you sure you want to delete your account? This can't be undone.",
      out: ["Sei sicuro", " di voler ", "cancellare", " il tuo account? ", "Questo non può essere annullato", "."],
      notes: [
        { tag: "Gender", text: "Masculine default. Excludes a good share of your users. Italian product copy writes “Vuoi davvero…”." },
        { tag: "Terminology", text: "Every other button in your UI says “Elimina”. Inconsistency on a destructive action costs trust." },
        { tag: "Register", text: "Literal passive; it reads translated. Native: “L'operazione non è reversibile.”" },
      ],
      footer: "BLEU and COMET would score this as fine. Your Italian users won't.",
    },
    audit: {
      title: "What an audit looks like",
      lead: "Six typical errors, reconstructed to show the shape of a report. Each row is one string: what the model produced, why it fails, how severe it is, and what to do about it. A real report ranks issues by frequency and points at the cause — prompt, data or model — so the team knows what to fix first. Three findings from actual client work are below.",
      cols: ["Source", "Output", "Issue", "Severity", "Fix"],
      rows: [
        ["Sign in to continue.", "Firma per continuare.", "Mistranslation: “sign” read as signature. Meaning lost.", "Critical", "Accedi per continuare."],
        ["We'll get back to you shortly.", "Torneremo da te a breve.", "Calque. Grammatical, unnatural; reads machine-made.", "Major", "Ti rispondiamo a breve."],
        ["Please enter a valid email.", "Per favore inserisci una email valida.", "Register: “per favore” is spoken, not UI. Article: “un'email”.", "Minor", "Inserisci un'email valida."],
        ["Your subscription has been cancelled.", "Il tuo abbonamento è stato annullato.", "Terminology: “annullato” conflicts with product glossary (“disdetto”).", "Major", "Il tuo abbonamento è stato disdetto."],
        ["Hi Alex, welcome back!", "Ciao Alex, bentornato!", "Gender: masculine agreement on an unknown user.", "Major", "Ciao Alex, è bello rivederti!"],
        ["Learn more", "Impara di più", "Calque; “imparare” is to study. Standard UI term exists.", "Minor", "Scopri di più"],
      ],
      after: "Pattern across the sample: 4 of 6 issues are register or calque, not grammar. That points at the prompt, not the model — a cheaper fix than fine-tuning.",
    },
    findings: {
      title: "Three findings from real work",
      lead: "From QA passes on a European marketplace's seller documentation, DE→IT. Client details are removed; the patterns are not. None of these is a typo, and none would be caught by reading the Italian on its own.",
      tagCertain: "Verified",
      tagOpen: "Open",
      items: [
        {
          n: "01",
          h: "The threshold that disappeared",
          where: "Help-centre page on cancellation fees.",
          body: "The German source lists two consecutive rate bands in a two-item bullet list; the higher band carries double the fee. The second Italian bullet is not a translation of the second German rule. It is a near-verbatim paraphrase of the first — one verb changed — different enough to slip past a duplicate-text check, close enough to give the copy away. The stricter band, and its higher fee, simply do not exist in Italian.",
          why: "Both Italian bullets are grammatically flawless. Reading the Italian alone tells you nothing. You see it only by aligning the German list item by item and noticing that a number is gone.",
          verified: "Read the raw HTML around the point to confirm both items sit in the same list, rather than an artefact of my alignment script.",
          sev: "Critical — direct commercial impact on a published fee policy.",
          tag: "certain",
        },
        {
          n: "02",
          h: "Two translations of the same page, never reconciled",
          where: "Regulatory page in the seller help centre.",
          body: "Two independent Italian files existed for one German source — same title, same source date, same starting content. They do not differ by an oversight; they diverge systematically, as if produced by two people who never spoke.",
          table: [
            ["Procedure step", "Fase 1 / 2 / 3", "Passaggio 1 / 2 / 3"],
            ["Nationality", "mercato olandese", "mercato neerlandese"],
            ["WEEE acronym", "WEEE/AEEA", "RAEE"],
            ["Take-back scheme", "ritiro 1:1", "ritiro uno contro uno"],
            ["Closing formula", "Esclusione di responsabilità", "Disclaimer"],
          ],
          why: "One version pairs the English and Italian acronyms inside the same parenthesis, where the standard Italian term alone — RAEE — is correct and sufficient. One typo is an accident; two complete, independent translations in circulation is a process failure, and precisely what translation memories and locked glossaries exist to prevent. A reader comparing two help pages sees two legal vocabularies for one concept.",
          sev: "High — terminology governance, not a single document.",
          tag: "certain",
        },
        {
          n: "03",
          h: "The link that vanished from one market",
          where: "Published seller case study on international expansion.",
          body: "The source names two markets in the same sentence, both as live links. The Italian keeps the link on the first and drops it on the second: same string, plain text, no anchor.",
          why: "I did not find this by reading — both versions are grammatically and semantically identical. The structural element count between source and target did not match, 24 blocks against 23, and I traced the missing element by hand. It is the only one of the three found by structural diff rather than by reading, and it needs the tooling and the patience to compare HTML element by element instead of text line by line.",
          sev: "Low — the Italian visitor loses a shortcut, nothing more.",
          tag: "certain",
        },
      ],
      method: "The same pass checked and discarded several other suspects: a VAT table across eight countries, a holiday calendar across six, a fee table across twelve product categories, nine country/IBAN pairs. All correct, line by line. Two structural count mismatches on other documents remain unresolved and are recorded as open, not as findings — the time spent ruling things out is the part of an audit nobody sees, and it is what separates a check from a list of suspicions.",
    },
    notes: {
      title: "Notes on how models fail in Italian",
      items: [
        { h: "The masculine default", p: "Italian marks gender on adjectives and participles. Models pick masculine unless told otherwise, so every “Sei sicuro?” and “Bentornato” quietly addresses half your users as men. The fix is usually not a rule but a rewrite: Italian product copy has a long tradition of gender-neutral phrasing that models rarely reach for on their own." },
        { h: "Tu, Lei, or neither", p: "English has one “you”; Italian has two, and the choice sets the register of the whole product. Models drift between them inside one flow, especially after a system prompt written in English. Most consumer products want “tu”; most banking and insurance want “Lei”; the worst outcome is both." },
        { h: "Grammatical but translated", p: "The errors that survive automatic evaluation are the ones that are technically correct: “Torneremo da te”, “Impara di più”, “Per favore inserisci”. Nothing is wrong; everything is off. These are what a native reviewer sees in the first second and a metric never sees at all." },
      ],
    },
    method: {
      title: "How it works",
      steps: [
        { h: "Free audit, 30 minutes", p: "You send 20–50 strings of Italian output. I return the top issues and say whether they look systematic." },
        { h: "Report", p: "Error taxonomy with severity, likely root cause and fixes your team can act on." },
        { h: "Retainer", p: "Monthly review on a cadence, so regressions surface before release rather than in support tickets." },
      ],
    },
    about: {
      title: "Who's reviewing",
      p1: "Alessio Di Rubbo. Native Italian, MA in Applied Linguistics from the University of Vienna, working from Vienna in German and English.",
      p2: "Since 2016 I've post-edited and evaluated machine output for global brands, including RLHF and SFT work on production translation models at Translated and adaptive NMT evaluation on the ModernMT project. I ran the end-to-end Italian launch of Kaufland's marketplace. Somewhere along the way the job changed from fixing errors to explaining why they happen.",
      clients: "Italian output validated for Amazon, NVIDIA, Stellantis, Kaufland and Translated.",
      photoAlt: "Alessio Di Rubbo",
    },
    cta: { title: "Send me twenty strings. I'll tell you what's wrong with them.", button: "Book a free audit", or: "or write to" },
    footer: { rights: "Alessio Di Rubbo · Vienna, Austria", lang: "Language" },
  },

  it: {
    htmlLang: "it",
    metaTitle: "Alessio Di Rubbo — Linguistic QA per team AI (italiano)",
    metaDesc: "Error analysis sull'output italiano dei modelli. Scopro dove il tuo modello sbaglia in italiano prima che lo scoprano gli utenti: audit, dati di valutazione, QA di lancio.",
    nav: { audit: "Audit di esempio", findings: "Reperti", notes: "Note", about: "Chi sono", cta: "Prenota un audit gratuito", menu: "Menu" },
    eyebrow: { audit: "audit", findings: "reperti", notes: "note", process: "metodo", about: "chi sono" },
    hero: {
      h1a: "Il tuo modello parla italiano.",
      h1b: "Io trovo dove ",
      h1mark: "sbaglia",
      h1c: ".",
      sub: "Error analysis sull'output italiano, fatta da un linguista che ha addestrato i modelli con cui ti confronti. Mi mandi stringhe; ricevi tassonomia, gravità, cause e correzioni.",
      cta: "Prenota un audit gratuito",
      secondary: "Guarda un audit di esempio",
      note: "Vienna. Da remoto, con team in area DACH, Italia e Stati Uniti.",
      creds: ["MA in Applied Linguistics, Università di Vienna", "RLHF e SFT su modelli di traduzione in produzione (Translated, ModernMT)", "Output italiano validato per Amazon, NVIDIA, Stellantis, Kaufland", "Vienna · remoto · EN, DE, IT"],
    },
    demo: {
      title: "Una stringa. Tre problemi che le tue metriche non vedono.",
      source: "Sorgente · EN",
      output: "Output del modello · IT",
      src: "Are you sure you want to delete your account? This can't be undone.",
      out: ["Sei sicuro", " di voler ", "cancellare", " il tuo account? ", "Questo non può essere annullato", "."],
      notes: [
        { tag: "Genere", text: "Maschile per default: esclude buona parte degli utenti. Il copy di prodotto scrive “Vuoi davvero…”." },
        { tag: "Terminologia", text: "Tutti gli altri pulsanti dicono “Elimina”. L'incoerenza su un'azione distruttiva costa fiducia." },
        { tag: "Registro", text: "Passivo letterale: si sente che è tradotto. Nativo: “L'operazione non è reversibile.”" },
      ],
      footer: "BLEU e COMET direbbero che va bene. I tuoi utenti italiani no.",
    },
    audit: {
      title: "Com'è fatto un audit",
      lead: "Sei errori tipici, ricostruiti per mostrare la forma di un report. Ogni riga è una stringa: cosa ha prodotto il modello, perché non va, quanto è grave, cosa fare. Un report reale ordina i problemi per frequenza e indica la causa — prompt, dati o modello — così il team sa cosa correggere per primo. Qui sotto tre reperti da lavoro reale.",
      cols: ["Sorgente", "Output", "Problema", "Gravità", "Correzione"],
      rows: [
        ["Sign in to continue.", "Firma per continuare.", "Errore di senso: “sign” letto come firma.", "Critico", "Accedi per continuare."],
        ["We'll get back to you shortly.", "Torneremo da te a breve.", "Calco. Grammaticale ma innaturale; sa di macchina.", "Grave", "Ti rispondiamo a breve."],
        ["Please enter a valid email.", "Per favore inserisci una email valida.", "Registro: “per favore” è parlato, non UI. Articolo: “un'email”.", "Lieve", "Inserisci un'email valida."],
        ["Your subscription has been cancelled.", "Il tuo abbonamento è stato annullato.", "Terminologia: “annullato” contraddice il glossario di prodotto (“disdetto”).", "Grave", "Il tuo abbonamento è stato disdetto."],
        ["Hi Alex, welcome back!", "Ciao Alex, bentornato!", "Genere: accordo maschile su un utente sconosciuto.", "Grave", "Ciao Alex, è bello rivederti!"],
        ["Learn more", "Impara di più", "Calco; “imparare” è studiare. Esiste il termine UI standard.", "Lieve", "Scopri di più"],
      ],
      after: "Pattern del campione: 4 problemi su 6 sono registro o calco, non grammatica. Indica il prompt, non il modello: una correzione più economica del fine-tuning.",
    },
    findings: {
      title: "Tre reperti da lavoro reale",
      lead: "Da passate di QA sulla documentazione rivenditori di un marketplace europeo, DE→IT. I riferimenti al cliente sono rimossi, i pattern no. Nessuno di questi è un refuso, e nessuno si trova leggendo l'italiano da solo.",
      tagCertain: "Verificato",
      tagOpen: "Aperto",
      items: [
        {
          n: "01",
          h: "La soglia che sparisce",
          where: "Pagina del centro assistenza sulle commissioni per annullamento.",
          body: "La sorgente tedesca definisce due fasce consecutive in un elenco puntato di due voci; la fascia superiore comporta una commissione doppia. La seconda voce italiana non è la traduzione della seconda regola tedesca: è una parafrasi quasi letterale della prima, con un solo verbo cambiato — abbastanza diversa da non far scattare un controllo automatico di duplicazione, abbastanza uguale da tradire la copia. La fascia più severa, e la sua commissione più alta, in italiano non esistono.",
          why: "Entrambe le voci italiane sono grammaticalmente perfette. Rileggere l'italiano da solo non rivela niente. Lo si vede solo allineando l'elenco tedesco voce per voce e accorgendosi che una soglia è scomparsa.",
          verified: "Ho letto l'HTML grezzo attorno al punto per confermare che le due voci appartengono allo stesso elenco e non sono un artefatto del mio script di allineamento.",
          sev: "Critica — impatto commerciale diretto su una politica tariffaria pubblicata.",
          tag: "certain",
        },
        {
          n: "02",
          h: "Due traduzioni della stessa pagina, mai riconciliate",
          where: "Pagina normativa del centro assistenza rivenditori.",
          body: "Per un unico sorgente tedesco esistevano due file italiani indipendenti: stesso titolo, stessa data di modifica, stesso contenuto di partenza. Non divergono per una svista: divergono in modo sistematico, come se fossero stati prodotti da due persone che non si sono mai parlate.",
          table: [
            ["Fase della procedura", "Fase 1 / 2 / 3", "Passaggio 1 / 2 / 3"],
            ["Aggettivo di nazionalità", "mercato olandese", "mercato neerlandese"],
            ["Acronimo RAEE", "WEEE/AEEA", "RAEE"],
            ["Ritiro usato-per-nuovo", "ritiro 1:1", "ritiro uno contro uno"],
            ["Formula di chiusura", "Esclusione di responsabilità", "Disclaimer"],
          ],
          why: "Una delle due versioni affianca l'acronimo inglese e quello italiano nella stessa parentesi, dove la sigla italiana normativa — RAEE — da sola è corretta e sufficiente. Un refuso è un incidente; due traduzioni complete e indipendenti in circolazione è un problema di processo, ed è esattamente lo scenario contro cui esistono le memorie di traduzione e i glossari vincolati. Chi confronta due pagine di assistenza vede due terminologie legali per lo stesso concetto.",
          sev: "Alta — governance terminologica, non singolo documento.",
          tag: "certain",
        },
        {
          n: "03",
          h: "Il collegamento che sparisce da un solo mercato",
          where: "Case study pubblicata su un rivenditore e la sua espansione internazionale.",
          body: "La sorgente cita due mercati nella stessa frase, entrambi come collegamenti attivi. L'italiano mantiene il link sul primo e lo perde sul secondo: stessa stringa, testo semplice, nessun tag.",
          why: "Non l'ho trovato leggendo: le due versioni sono grammaticalmente e semanticamente identiche. Il conteggio degli elementi strutturali tra sorgente e target non tornava — 24 blocchi contro 23 — e sono risalito a mano all'elemento mancante. È l'unico dei tre trovato per differenza strutturale invece che per lettura, e richiede gli strumenti e la pazienza per confrontare l'HTML elemento per elemento anziché il testo riga per riga.",
          sev: "Bassa — il visitatore italiano perde una scorciatoia, nulla di più.",
          tag: "certain",
        },
      ],
      method: "La stessa passata ha verificato e scartato diversi altri sospetti: una tabella IVA su otto paesi, un calendario festività su sei, una tabella tariffaria su dodici categorie merceologiche, nove coppie paese/IBAN. Tutti corretti, riga per riga. Due scarti di conteggio strutturale su altri documenti restano irrisolti e sono registrati come aperti, non come reperti — il tempo speso a escludere è la parte di un audit che non si vede, ed è ciò che separa un controllo vero da un elenco di sospetti.",
    },
    notes: {
      title: "Note su come i modelli sbagliano in italiano",
      items: [
        { h: "Il maschile per default", p: "L'italiano marca il genere su aggettivi e participi. I modelli scelgono il maschile se non istruiti diversamente, e ogni “Sei sicuro?” o “Bentornato” si rivolge a metà degli utenti come a uomini. La soluzione di solito non è una regola ma una riscrittura: il copy di prodotto italiano ha una lunga tradizione di formule neutre che i modelli raramente usano da soli." },
        { h: "Tu, Lei o nessuno dei due", p: "L'inglese ha un solo “you”; l'italiano ne ha due, e la scelta fissa il registro dell'intero prodotto. I modelli oscillano tra i due dentro lo stesso flusso, soprattutto con un system prompt scritto in inglese. La maggior parte dei prodotti consumer vuole il “tu”; banche e assicurazioni vogliono il “Lei”; l'esito peggiore è averli entrambi." },
        { h: "Grammaticale ma tradotto", p: "Gli errori che sopravvivono alla valutazione automatica sono quelli tecnicamente corretti: “Torneremo da te”, “Impara di più”, “Per favore inserisci”. Niente è sbagliato; tutto è fuori posto. Sono ciò che un revisore madrelingua vede nel primo secondo e una metrica non vede mai." },
      ],
    },
    method: {
      title: "Come funziona",
      steps: [
        { h: "Audit gratuito, 30 minuti", p: "Mi mandi 20–50 stringhe di output italiano. Ti restituisco i problemi principali e ti dico se sembrano sistematici." },
        { h: "Report", p: "Tassonomia degli errori con gravità, causa probabile e correzioni su cui il team può agire." },
        { h: "Retainer", p: "Revisione mensile a cadenza fissa, così le regressioni emergono prima del rilascio e non nei ticket di supporto." },
      ],
    },
    about: {
      title: "Chi revisiona",
      p1: "Alessio Di Rubbo. Madrelingua italiano, MA in Applied Linguistics all'Università di Vienna, lavoro da Vienna in tedesco e inglese.",
      p2: "Dal 2016 faccio post-editing e valutazione di output automatico per brand globali, incluso lavoro RLHF e SFT su modelli di traduzione in produzione per Translated e valutazione di NMT adattiva sul progetto ModernMT. Ho seguito il lancio italiano end-to-end del marketplace Kaufland. A un certo punto il lavoro è passato dal correggere errori allo spiegare perché succedono.",
      clients: "Output italiano validato per Amazon, NVIDIA, Stellantis, Kaufland e Translated.",
      photoAlt: "Alessio Di Rubbo",
    },
    cta: { title: "Mandami venti stringhe. Ti dico cosa non va.", button: "Prenota un audit gratuito", or: "oppure scrivi a" },
    footer: { rights: "Alessio Di Rubbo · Vienna, Austria", lang: "Lingua" },
  },

  de: {
    htmlLang: "de",
    metaTitle: "Alessio Di Rubbo — Linguistic QA für KI-Teams (Italienisch)",
    metaDesc: "Fehleranalyse für italienischen Modell-Output. Ich finde, wo Ihr Modell auf Italienisch danebenliegt, bevor Ihre Nutzer es merken: Audits, Evaluationsdaten, Launch-QA.",
    nav: { audit: "Beispiel-Audit", findings: "Befunde", notes: "Notizen", about: "Über mich", cta: "Kostenloses Audit buchen", menu: "Menü" },
    eyebrow: { audit: "audit", findings: "befunde", notes: "notizen", process: "ablauf", about: "über mich" },
    hero: {
      h1a: "Ihr Modell spricht Italienisch.",
      h1b: "Ich finde, wo es ",
      h1mark: "danebenliegt",
      h1c: ".",
      sub: "Fehleranalyse für italienischen Output, von einem Linguisten, der die Modelle mittrainiert hat, gegen die Sie evaluieren. Sie schicken Strings; Sie bekommen Taxonomie, Schweregrade, Ursachen und Korrekturen.",
      cta: "Kostenloses Audit buchen",
      secondary: "Beispiel-Audit ansehen",
      note: "Wien. Remote, mit Teams in DACH, Italien und den USA.",
      creds: ["MA Angewandte Linguistik, Universität Wien", "RLHF und SFT an produktiven Übersetzungsmodellen (Translated, ModernMT)", "Italienischer Output validiert für Amazon, NVIDIA, Stellantis, Kaufland", "Wien · remote · EN, DE, IT"],
    },
    demo: {
      title: "Ein String. Drei Probleme, die Ihre Metriken nicht sehen.",
      source: "Quelle · EN",
      output: "Modell-Output · IT",
      src: "Are you sure you want to delete your account? This can't be undone.",
      out: ["Sei sicuro", " di voler ", "cancellare", " il tuo account? ", "Questo non può essere annullato", "."],
      notes: [
        { tag: "Genus", text: "Maskulinum als Default: schließt einen guten Teil der Nutzer aus. Italienischer Product-Copy schreibt „Vuoi davvero…“." },
        { tag: "Terminologie", text: "Jeder andere Button heißt „Elimina“. Inkonsistenz bei einer destruktiven Aktion kostet Vertrauen." },
        { tag: "Register", text: "Wörtliches Passiv, klingt übersetzt. Nativ: „L'operazione non è reversibile.“" },
      ],
      footer: "BLEU und COMET würden das durchwinken. Ihre italienischen Nutzer nicht.",
    },
    audit: {
      title: "So sieht ein Audit aus",
      lead: "Sechs typische Fehler, rekonstruiert, um die Form eines Reports zu zeigen. Jede Zeile ist ein String: was das Modell produziert hat, warum es scheitert, wie schwer, und was zu tun ist. Ein echter Report ordnet Probleme nach Häufigkeit und benennt die Ursache — Prompt, Daten oder Modell. Darunter drei Befunde aus echter Arbeit.",
      cols: ["Quelle", "Output", "Problem", "Schweregrad", "Korrektur"],
      rows: [
        ["Sign in to continue.", "Firma per continuare.", "Sinnfehler: „sign“ als Unterschrift gelesen.", "Kritisch", "Accedi per continuare."],
        ["We'll get back to you shortly.", "Torneremo da te a breve.", "Lehnübersetzung. Grammatisch, aber unnatürlich; klingt maschinell.", "Schwer", "Ti rispondiamo a breve."],
        ["Please enter a valid email.", "Per favore inserisci una email valida.", "Register: „per favore“ ist gesprochen, nicht UI. Artikel: „un'email“.", "Leicht", "Inserisci un'email valida."],
        ["Your subscription has been cancelled.", "Il tuo abbonamento è stato annullato.", "Terminologie: „annullato“ widerspricht dem Produktglossar („disdetto“).", "Schwer", "Il tuo abbonamento è stato disdetto."],
        ["Hi Alex, welcome back!", "Ciao Alex, bentornato!", "Genus: maskuline Kongruenz bei unbekanntem Nutzer.", "Schwer", "Ciao Alex, è bello rivederti!"],
        ["Learn more", "Impara di più", "Lehnübersetzung; „imparare“ heißt lernen. Standard-UI-Begriff existiert.", "Leicht", "Scopri di più"],
      ],
      after: "Muster in der Stichprobe: 4 von 6 Problemen sind Register oder Lehnübersetzung, nicht Grammatik. Das zeigt auf den Prompt, nicht auf das Modell — eine günstigere Korrektur als Fine-Tuning.",
    },
    findings: {
      title: "Drei Befunde aus echter Arbeit",
      lead: "Aus QA-Durchgängen an der Händlerdokumentation eines europäischen Marktplatzes, DE→IT. Kundenbezüge sind entfernt, die Muster nicht. Keiner dieser Befunde ist ein Tippfehler, und keiner lässt sich finden, indem man nur das Italienische liest.",
      tagCertain: "Verifiziert",
      tagOpen: "Offen",
      items: [
        {
          n: "01",
          h: "Die Schwelle, die verschwindet",
          where: "Hilfecenter-Seite zu Stornogebühren.",
          body: "Die deutsche Quelle nennt zwei aufeinanderfolgende Staffeln in einer zweigliedrigen Aufzählung; die höhere Staffel kostet doppelt. Der zweite italienische Punkt ist keine Übersetzung der zweiten deutschen Regel, sondern eine fast wörtliche Paraphrase des ersten — ein Verb geändert: verschieden genug, um einer automatischen Dublettenprüfung zu entgehen, ähnlich genug, um die Kopie zu verraten. Die strengere Staffel und ihre höhere Gebühr existieren im Italienischen schlicht nicht.",
          why: "Beide italienischen Punkte sind grammatisch einwandfrei. Das Italienische allein zu lesen verrät nichts. Man sieht es nur, wenn man die deutsche Liste Punkt für Punkt abgleicht und bemerkt, dass eine Zahl fehlt.",
          verified: "Ich habe das rohe HTML rund um die Stelle gelesen, um zu bestätigen, dass beide Punkte in derselben Liste stehen und es kein Artefakt meines Alignment-Skripts ist.",
          sev: "Kritisch — direkte kommerzielle Auswirkung auf eine veröffentlichte Gebührenordnung.",
          tag: "certain",
        },
        {
          n: "02",
          h: "Zwei Übersetzungen derselben Seite, nie abgeglichen",
          where: "Regulatorische Seite im Händler-Hilfecenter.",
          body: "Für eine deutsche Quelle existierten zwei unabhängige italienische Dateien: gleicher Titel, gleiches Änderungsdatum, gleicher Ausgangstext. Sie unterscheiden sich nicht durch ein Versehen, sondern systematisch — als stammten sie von zwei Personen, die nie miteinander gesprochen haben.",
          table: [
            ["Verfahrensschritt", "Fase 1 / 2 / 3", "Passaggio 1 / 2 / 3"],
            ["Nationalitätsadjektiv", "mercato olandese", "mercato neerlandese"],
            ["WEEE-Akronym", "WEEE/AEEA", "RAEE"],
            ["Rücknahmeverfahren", "ritiro 1:1", "ritiro uno contro uno"],
            ["Schlussformel", "Esclusione di responsabilità", "Disclaimer"],
          ],
          why: "Eine der Versionen stellt das englische und das italienische Akronym in dieselbe Klammer, wo die italienische Normbezeichnung — RAEE — allein korrekt und ausreichend ist. Ein Tippfehler ist ein Unfall; zwei vollständige, unabhängige Übersetzungen im Umlauf sind ein Prozessfehler, und genau dagegen existieren Translation Memories und verbindliche Glossare. Wer zwei Hilfeseiten vergleicht, sieht zwei Rechtsterminologien für denselben Begriff.",
          sev: "Hoch — Terminologie-Governance, nicht ein einzelnes Dokument.",
          tag: "certain",
        },
        {
          n: "03",
          h: "Der Link, der aus einem Markt verschwindet",
          where: "Veröffentlichte Händler-Case-Study zur internationalen Expansion.",
          body: "Die Quelle nennt zwei Märkte im selben Satz, beide als aktive Links. Das Italienische behält den Link beim ersten und verliert ihn beim zweiten: gleiche Zeichenfolge, reiner Text, kein Anchor.",
          why: "Gefunden habe ich das nicht durch Lesen — beide Fassungen sind grammatisch und semantisch identisch. Die Zahl der Strukturelemente stimmte zwischen Quelle und Ziel nicht überein, 24 Blöcke gegen 23, und ich habe das fehlende Element von Hand zurückverfolgt. Es ist der einzige der drei Befunde, der über einen strukturellen Abgleich statt über Lesen gefunden wurde.",
          sev: "Gering — der italienische Besucher verliert nur eine Abkürzung.",
          tag: "certain",
        },
      ],
      method: "Derselbe Durchgang hat mehrere weitere Verdachtsfälle geprüft und verworfen: eine Mehrwertsteuertabelle über acht Länder, ein Feiertagskalender über sechs, eine Gebührentabelle über zwölf Produktkategorien, neun Land/IBAN-Paare. Alle korrekt, Zeile für Zeile. Zwei strukturelle Zähldifferenzen in anderen Dokumenten sind ungeklärt und als offen vermerkt, nicht als Befund — die Zeit, die man mit dem Ausschließen verbringt, ist der Teil eines Audits, den niemand sieht.",
    },
    notes: {
      title: "Notizen dazu, wie Modelle auf Italienisch scheitern",
      items: [
        { h: "Das maskuline Default", p: "Italienisch markiert Genus an Adjektiven und Partizipien. Modelle wählen das Maskulinum, wenn nichts anderes vorgegeben ist, und jedes „Sei sicuro?“ oder „Bentornato“ spricht die Hälfte der Nutzer als Männer an. Die Lösung ist meist keine Regel, sondern eine Umformulierung: italienischer Product-Copy hat eine lange Tradition genusneutraler Formeln, die Modelle von sich aus selten wählen." },
        { h: "Tu, Lei oder keins von beiden", p: "Englisch hat ein „you“; Italienisch hat zwei, und die Wahl legt das Register des ganzen Produkts fest. Modelle schwanken innerhalb eines Flows zwischen beiden, besonders nach einem englischen System-Prompt. Die meisten Consumer-Produkte wollen „tu“; Banken und Versicherungen „Lei“; das schlechteste Ergebnis ist beides." },
        { h: "Grammatisch korrekt, aber übersetzt", p: "Die Fehler, die die automatische Evaluation überstehen, sind die technisch korrekten: „Torneremo da te“, „Impara di più“, „Per favore inserisci“. Nichts ist falsch; alles ist daneben. Genau das sieht ein muttersprachlicher Reviewer in der ersten Sekunde und eine Metrik nie." },
      ],
    },
    method: {
      title: "So läuft es ab",
      steps: [
        { h: "Kostenloses Audit, 30 Minuten", p: "Sie schicken 20–50 Strings italienischen Outputs. Ich melde die wichtigsten Probleme zurück und sage, ob sie systematisch wirken." },
        { h: "Report", p: "Fehlertaxonomie mit Schweregrad, wahrscheinlicher Ursache und Korrekturen, mit denen Ihr Team arbeiten kann." },
        { h: "Retainer", p: "Monatliche Review im festen Rhythmus, damit Regressionen vor dem Release auffallen und nicht im Support." },
      ],
    },
    about: {
      title: "Wer prüft",
      p1: "Alessio Di Rubbo. Italienischer Muttersprachler, MA in Angewandter Linguistik an der Universität Wien, arbeite von Wien aus auf Deutsch und Englisch.",
      p2: "Seit 2016 post-editiere und evaluiere ich maschinellen Output für globale Marken, darunter RLHF- und SFT-Arbeit an produktiven Übersetzungsmodellen bei Translated und Evaluation adaptiver NMT im ModernMT-Projekt. Den italienischen Launch des Kaufland-Marktplatzes habe ich end-to-end betreut. Irgendwann hat sich der Job verschoben: vom Korrigieren von Fehlern zum Erklären, warum sie entstehen.",
      clients: "Italienischer Output validiert für Amazon, NVIDIA, Stellantis, Kaufland und Translated.",
      photoAlt: "Alessio Di Rubbo",
    },
    cta: { title: "Schicken Sie mir zwanzig Strings. Ich sage Ihnen, was daran nicht stimmt.", button: "Kostenloses Audit buchen", or: "oder schreiben Sie an" },
    footer: { rights: "Alessio Di Rubbo · Wien, Österreich", lang: "Sprache" },
  },
};

/* ---------- helpers -------------------------------------------------------- */
function detectLang() {
  try { const s = window.localStorage.getItem(STORAGE_KEY); if (LANGS.includes(s)) return s; } catch (_) {}
  const nav = (typeof navigator !== "undefined" && navigator.language) || "en";
  const short = nav.slice(0, 2).toLowerCase();
  return LANGS.includes(short) ? short : "en";
}
function persistLang(l) { try { window.localStorage.setItem(STORAGE_KEY, l); } catch (_) {} }

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

/** Zero-dependency head management: title, description, OG, JSON-LD. */
function useHead(lang, t) {
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title = t.metaTitle;
    setMeta("description", t.metaDesc);
    setMeta("og:title", t.metaTitle, "property");
    setMeta("og:description", t.metaDesc, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:url", SITE_URL, "property");
    setMeta("og:image", `${SITE_URL}/og.jpg`, "property");
    setMeta("twitter:card", "summary_large_image");
    const ld = {
      "@context": "https://schema.org", "@type": "ProfessionalService",
      name: "Alessio Di Rubbo — Linguistic QA for AI teams", url: SITE_URL, email: EMAIL,
      areaServed: ["IT", "DE", "AT", "CH", "US"],
      address: { "@type": "PostalAddress", addressLocality: "Vienna", addressCountry: "AT" },
      founder: { "@type": "Person", name: "Alessio Di Rubbo", jobTitle: "Linguistic QA Specialist (Italian)", sameAs: [LINKEDIN], alumniOf: "University of Vienna", knowsLanguage: ["it", "de", "en"] },
      serviceType: ["Linguistic QA", "LLM evaluation", "Italian localization"],
    };
    let s = document.getElementById("ld-json");
    if (!s) { s = document.createElement("script"); s.id = "ld-json"; s.type = "application/ld+json"; document.head.appendChild(s); }
    s.textContent = JSON.stringify(ld);
  }, [lang, t]);
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("adr-fonts")) return;
    const l = document.createElement("link"); l.id = "adr-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?" + THEME.fonts + "&display=swap";
    document.head.appendChild(l);
  }, []);
}

/* ---------- styles (tokens from DESIGN.md) ------------------------------- */
const CSS = `
  :root{ ${THEME.vars} }
  html{scroll-behavior:smooth} section[id]{scroll-margin-top:56px}
  @media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto} *{transition:none!important;animation:none!important} }
  body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
  @media (min-width:768px){ body{font-size:19px} }
  .mono{font-family:var(--mono)}
  .ink2{color:var(--ink-2)}
  .rule{border-color:var(--rule)}
  .h1{font-family:var(--display);font-size:2.25rem;line-height:1.08;font-weight:var(--h1w);letter-spacing:var(--h1ls);text-wrap:balance}
  @media (min-width:768px){ .h1{font-size:3.25rem} }
  .t2 .h1{font-size:2.5rem;line-height:1}
  @media (min-width:768px){ .t2 .h1{font-size:4.5rem} }
  .t2 .h2{font-size:2rem}
  @media (min-width:768px){ .t2 .h2{font-size:2.6rem} }
  .t2 .cap-label{font-family:var(--mono);text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;color:var(--ink-2)}
  .t2 header a,.t2 header .lang button{color:#EDEFEA}
  header .bar{height:64px;transition:height .2s ease}
  header.slim .bar{height:44px}
  .nav-links{transition:opacity .15s}
  header.slim:not(.h-paper) .nav-links{opacity:0;pointer-events:none}
  .t2 header a.nav:hover{color:#fff}
  .t2 header .lang button:hover{color:#fff}
  .t2 header .lang button[aria-current="true"]{background:#EDEFEA;color:var(--ink)}
  .t2 header .btn-solid{background:#EDEFEA;color:var(--ink);border-color:#EDEFEA}
  .t2 .rule{border-color:var(--rule)}
  .t2 .pen-under{text-decoration-thickness:5px;text-underline-offset:8px}
  .h2{font-family:var(--display);font-size:1.75rem;line-height:1.15;font-weight:var(--h1w);letter-spacing:var(--h1ls)}
  @media (min-width:768px){ .h2{font-size:2rem} }
  .h3{font-family:var(--display);font-size:1.25rem;line-height:1.3;font-weight:600}
  .cap{font-size:.9rem;line-height:1.5}
  .btn{display:inline-flex;align-items:center;justify-content:center;padding:1.1rem 2rem;border-radius:0;font-weight:600;line-height:1;font-size:1.05rem;
       border:0;background:var(--ink);color:var(--paper);transition:background .15s,color .15s,border-color .15s}
  .btn:hover{background:var(--pen);color:#fff}

  /* findings: long-form verification notes. Numbered like annotations, marked like a report. */
  .finding{border-top:1px solid var(--rule);padding-top:1.7rem}
  .finding .fn{font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;color:var(--pen);font-weight:500}
  .finding .fh{font-family:var(--display);font-size:1.35rem;font-weight:700;letter-spacing:-.02em;line-height:1.2;margin-top:.35rem}
  .finding .fwhere{font-family:var(--mono);font-size:.8rem;color:var(--ink-2);margin-top:.5rem}
  .finding p{margin-top:.9rem;font-size:1rem;line-height:1.62;color:var(--ink-2)}
  .finding p.lead-p{color:var(--ink)}
  .badge{display:inline-flex;align-items:center;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;
       text-transform:uppercase;font-weight:500;padding:.2em .5em;margin-right:.5rem}
  .badge-ok{background:#D6E8DC;color:#124834}
  .badge-open{background:transparent;color:var(--ink-2);border:1px solid var(--rule)}
  .sev{font-family:var(--mono);font-size:.82rem;color:var(--ink);margin-top:1rem;
       border-left:3px solid var(--pen);padding-left:.7rem}
  table.divtab{border-collapse:collapse;width:100%;margin-top:1.1rem;font-size:.88rem}
  table.divtab th{text-align:left;font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;
       color:var(--ink-2);font-weight:500;padding:.4rem .7rem .4rem 0;border-bottom:1.5px solid var(--ink)}
  table.divtab td{padding:.55rem .7rem .55rem 0;border-bottom:1px solid var(--rule);vertical-align:top;font-family:var(--mono)}
  table.divtab td:first-child{font-family:var(--sans);color:var(--ink-2)}
  .method-note{border-top:1px solid var(--rule);margin-top:2.4rem;padding-top:1.4rem;font-size:.95rem;
       line-height:1.6;color:var(--ink-2)}

  /* mobile navigation: a hamburger that opens an inline panel under the bar */
  .burger{display:inline-flex;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;
       align-items:center;background:transparent;border:0;cursor:pointer;margin-left:-10px}
  .burger span{display:block;width:22px;height:2px;background:var(--ink);transition:transform .18s,opacity .18s}
  .burger[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .burger[aria-expanded="true"] span:nth-child(2){opacity:0}
  .burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .menu-panel{border-top:1px solid var(--rule);background:var(--paper)}
  .menu-panel a{display:block;padding:.95rem 0;font-size:1.15rem;font-weight:500;border-bottom:1px solid var(--rule)}
  .menu-panel a:last-child{border-bottom:0;text-decoration:underline;text-decoration-color:var(--ok);
       text-decoration-thickness:2px;text-underline-offset:5px}
  @media (min-width:768px){ .burger{display:none} .menu-panel{display:none} }

  /* ---- header variants ---- */
  /* paper: no dark slab; the bar sits on the page and is held by a hairline */
  header.h-paper{background:var(--paper);border-bottom:1px solid var(--rule)}
  header.h-paper a,header.h-paper .lang button{color:var(--ink)}
  header.h-paper .lang button[aria-current="true"]{background:transparent;color:var(--ink);text-decoration:underline;
       text-decoration-color:var(--ok);text-decoration-thickness:2px;text-underline-offset:4px}
  header.h-paper .brand{font-weight:600}
  /* inline: header is part of the text column and scrolls away; a slim strip returns on scroll */
  header.h-inline{position:relative;background:transparent;border-bottom:0}
  header.h-inline .bar{height:auto;padding-top:2rem;padding-bottom:0}
  .strip{position:fixed;top:0;left:0;right:0;z-index:30;background:var(--paper);border-bottom:1px solid var(--rule);
       transform:translateY(-100%);transition:transform .22s ease}
  .strip.on{transform:translateY(0)}
  .strip .inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:46px}
  /* minimal: name and languages only; navigation lives in the page */
  header.h-minimal{background:var(--paper);border-bottom:0}
  header.h-minimal a,header.h-minimal .lang button{color:var(--ink)}
  header.h-minimal .lang button[aria-current="true"]{background:transparent;color:var(--ink);
       text-decoration:underline;text-decoration-color:var(--ok);text-decoration-thickness:2px;text-underline-offset:4px}
  /* header CTA as quiet text, never a block */
  .cta-quiet{font-weight:500;font-size:.98rem;text-decoration:underline;text-decoration-color:var(--ok);
       text-decoration-thickness:2px;text-underline-offset:5px}
  .cta-quiet:hover{color:var(--ok)}

  /* CTA: highlighter on the text itself, in the "resolved" green used for fixes.
     Not the pen red (error) and not the review yellow (under examination). */
  .btn.marktext{background:transparent;color:var(--ink);padding:.5rem 0;font-size:1.4rem;font-weight:700;letter-spacing:-.02em;
       min-height:44px;align-items:center}
  .btn.marktext span{background:#D6E8DC;border-bottom:4px solid var(--ok);padding:.05em .3em .12em}
  .btn.marktext:hover{background:transparent;color:var(--ink)}
  .btn.marktext:hover span{background:#C2DECB}
  /* on the dark closing block the same mark needs a brighter ground */
  .on-ink .btn.marktext span{background:#BFE0CB;border-bottom-color:#6FCB9B;color:var(--ink)}
  .on-ink .btn.marktext{color:var(--ink)}
  .on-ink .btn.marktext:hover span{background:#A9D6B9}

  /* secondary action is typographic, not a second box */
  .link-action{display:inline-flex;align-items:center;font-weight:500;font-size:1.02rem;color:var(--ink-2);
       text-decoration:underline;text-decoration-color:var(--rule);text-decoration-thickness:1px;text-underline-offset:5px}
  .link-action:hover{color:var(--pen)}
  .btn:focus-visible,a:focus-visible,button:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--pen);outline-offset:3px}
  a.u{text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px} a.u:hover{color:var(--pen)}
  a.nav{text-decoration:none} a.nav:hover{text-decoration:underline;text-underline-offset:4px}
  /* the reviewer's pen */
  .pen-under{text-decoration:underline;text-decoration-color:var(--pen);text-decoration-thickness:3px;text-underline-offset:6px}
  .flag{background:var(--mark);border-bottom:2px solid var(--pen);padding:0 .1em;cursor:default;transition:background .15s}
  .flag sup{font-family:var(--sans);font-size:.7em;color:var(--pen);font-weight:600;margin-left:.15em;background:var(--paper);padding:0 .1em}
  .flag.on{background:var(--mark-on)}
  .note{border-left:2px solid var(--rule);padding-left:1rem;transition:border-color .15s}
  .note.on{border-left-color:var(--pen)}
  .tag{color:var(--pen);font-weight:600}
  .note-title{border-bottom:3px solid var(--pen);display:inline;padding-bottom:2px}
  .t2 .note-title{border-bottom-width:4px;padding-bottom:3px}
  table.audit{border-collapse:collapse;width:100%}
  table.audit th{text-align:left;font-weight:500;color:var(--ink-2);padding:.6rem .75rem .6rem 0;border-bottom:1.5px solid var(--ink);font-size:.9rem;vertical-align:bottom}
  table.audit td{padding:.85rem .75rem .85rem 0;border-bottom:1px solid var(--rule);vertical-align:top;font-size:.95rem;line-height:1.45}
  table.audit td.mono{font-family:var(--mono);font-size:.88rem}
  table.audit td.out span{background:var(--mark);box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:0 .15em}
  table.audit td.fix{color:var(--ok)}
  .lang button{padding:.3rem .5rem;border-radius:3px;font-size:.9rem;color:var(--ink-2)}
  .lang button[aria-current="true"]{background:var(--ink);color:#fff}
  .photo{aspect-ratio:1/1;background:#EDEBE4;border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--ink-2);font-size:.9rem;text-align:center;padding:1rem}
  .step-n{font-family:var(--mono);font-size:1rem;color:var(--pen);font-weight:500;padding-top:.35rem;min-width:2ch}
`;

/* ---------- components ----------------------------------------------------- */
function LangPicker({ lang, setLang, label }) {
  return (
    <div className="lang flex items-center gap-1" role="group" aria-label={label}>
      {LANGS.map((l) => (
        <button key={l} type="button" aria-current={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function CtaButton({ label, light = false, compact = false }) {
  const href = CALENDLY_URL || `mailto:${EMAIL}?subject=Free%20Italian%20QA%20audit`;
  const style = {
    ...(light ? { background: "var(--paper)", color: "var(--ink)" } : {}),
    ...(compact ? { padding: ".65rem 1.15rem", fontSize: ".95rem" } : {}),
  };
  // The highlighter treatment is for the two big CTAs; the header keeps a compact solid block.
  const marked = BTN_STYLE === "kgreen" && !compact;
  return (
    <a className={`btn ${marked ? "marktext" : ""}`} style={style} href={href}
       target={CALENDLY_URL ? "_blank" : undefined} rel={CALENDLY_URL ? "noopener noreferrer" : undefined}>
      {marked ? <span>{label}</span> : label}
    </a>
  );
}

function Demo({ d }) {
  const [active, setActive] = useState(null);
  const flagged = [0, 2, 4];
  return (
    <div className="border-t border-b rule py-6 sm:py-8">
      <h3 className="h3 mb-5" style={{ fontWeight: 500 }}>{d.title}</h3>
      <div className="mono space-y-4" style={{ fontSize: ".95rem" }}>
        <div>
          <div className="ink2 cap mb-1">{d.source}</div>
          <p className="leading-relaxed">{d.src}</p>
        </div>
        <div>
          <div className="ink2 cap mb-1">{d.output}</div>
          <p className="leading-loose">
            {d.out.map((chunk, i) => {
              const fi = flagged.indexOf(i);
              if (fi === -1) return <span key={i}>{chunk}</span>;
              return (
                <span key={i} className={`flag ${active === fi ? "on" : ""}`} tabIndex={0} role="button" aria-describedby={`note-${fi}`}
                      onMouseEnter={() => setActive(fi)} onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(fi)} onBlur={() => setActive(null)}
                      onClick={() => setActive(active === fi ? null : fi)}>
                  {chunk}<sup>{fi + 1}</sup>
                </span>
              );
            })}
          </p>
        </div>
      </div>
      <ol className="mt-6 space-y-3 cap">
        {d.notes.map((n, i) => (
          <li key={i} id={`note-${i}`} className={`note ${active === i ? "on" : ""}`}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className="tag">{i + 1} · {n.tag}</span><span className="ink2"> — {n.text}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 pt-4 border-t rule" style={{ fontSize: "1rem", fontWeight: 500 }}>{d.footer}</p>
    </div>
  );
}

function AuditTable({ a }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
      <table className="audit" style={{ minWidth: 820 }}>
        <thead><tr>{a.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {a.rows.map((r, i) => (
            <tr key={i}>
              <td className="mono" style={{ width: "19%" }}>{r[0]}</td>
              <td className="mono out" style={{ width: "21%" }}><span>{r[1]}</span></td>
              <td style={{ width: "30%" }}>{r[2]}</td>
              <td style={{ width: "10%" }}>{r[3]}</td>
              <td className="mono fix" style={{ width: "20%" }}>{r[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/** One long-form finding: what it was, what I found, why it survives a normal read. */
function Finding({ f, t }) {
  return (
    <article className="finding grid md:grid-cols-12 gap-6 md:gap-9">
      <header className="md:col-span-4">
        <div className="fn">{f.n} / {t.tagCertain}</div>
        <h3 className="fh">{f.h}</h3>
        <div className="fwhere">{f.where}</div>
      </header>
      <div className="md:col-span-8" style={{ maxWidth: 640 }}>
      <p className="lead-p" style={{ marginTop: 0 }}>{f.body}</p>
      {f.table && (
        <table className="divtab">
          <thead><tr><th /><th>A</th><th>B</th></tr></thead>
          <tbody>
            {f.table.map((r, i) => (
              <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <p>{f.why}</p>
      {f.verified && (
        <p><span className="badge badge-ok">{t.tagCertain}</span>{f.verified}</p>
      )}
      <div className="sev">{f.sev}</div>
      </div>
    </article>
  );
}

/* ---------- app ------------------------------------------------------------ */
/** Header shrinks after the first screenful, so it stays reachable without dominating. */
function useSlimHeader() {
  const [slim, setSlim] = useState(false);
  useEffect(() => {
    const onScroll = () => setSlim(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return slim;
}

export default function App() {
  const [lang, setLangState] = useState(detectLang);
  const slim = useSlimHeader();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    const onClick = (e) => { if (!e.target.closest("header")) setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);
  const t = useMemo(() => T[lang], [lang]);
  useFonts();
  useHead(lang, t);
  const setLang = (l) => { setLangState(l); persistLang(l); };

  const wrap = "mx-auto px-6 sm:px-12";
  const page = { maxWidth: 1120 };
  const text = { maxWidth: 720 };

  return (
    <div className={`min-h-screen ${THEME_ID === "grottesca2" ? "t2" : ""}`} style={{ background: "var(--paper)" }}>
      <style>{CSS}</style>

      {HEADER_STYLE === "inline" && (
        <div className={`strip ${slim ? "on" : ""}`}>
          <div className={`${wrap} inner`} style={page}>
            <a href="#top" style={{ fontWeight: 600, fontSize: ".98rem" }}>Alessio Di Rubbo</a>
            <div className="flex items-center gap-5">
              <LangPicker lang={lang} setLang={setLang} label={t.footer.lang} />
              <a href={CALENDLY_URL || `mailto:${EMAIL}`} className="cta-quiet hidden sm:inline">{t.nav.cta}</a>
            </div>
          </div>
        </div>
      )}

      <header
        className={
          HEADER_STYLE === "inline" ? "h-inline"
          : `sticky top-0 z-20 ${slim ? "slim" : ""} ` +
            (HEADER_STYLE === "paper" ? "h-paper" : HEADER_STYLE === "minimal" ? "h-minimal" : "border-b rule")
        }
        style={HEADER_STYLE === "dark" ? { background: "var(--ink)" } : undefined}
      >
        <nav className={`${wrap} bar flex items-center gap-8`} style={page}>
          <button
            type="button"
            className="burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t.nav.menu}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
          {LOGO_SRC && (
            <a href="#top" className="brand shrink-0" aria-label="Alessio Di Rubbo">
              <img src={LOGO_SRC} alt="Alessio Di Rubbo" style={{ height: 26, width: "auto", display: "block" }} />
            </a>
          )}
          <div className="nav-links hidden md:flex items-center gap-7" style={{ fontSize: "1rem" }}>
            <a href="#audit" className="nav">{t.nav.audit}</a>
            <a href="#findings" className="nav">{t.nav.findings}</a>
            <a href="#notes" className="nav">{t.nav.notes}</a>
            <a href="#about" className="nav">{t.nav.about}</a>
          </div>
          <div className="flex items-center gap-5 ml-auto">
            <LangPicker lang={lang} setLang={setLang} label={t.footer.lang} />
            <a href={CALENDLY_URL || `mailto:${EMAIL}`} className="cta-quiet hidden sm:inline">{t.nav.cta}</a>
          </div>
        </nav>
        {menuOpen && (
          <div id="mobile-menu" className="menu-panel md:hidden">
            <div className={`${wrap} py-2`} style={page}>
              <a href="#audit" onClick={() => setMenuOpen(false)}>{t.nav.audit}</a>
              <a href="#findings" onClick={() => setMenuOpen(false)}>{t.nav.findings}</a>
              <a href="#notes" onClick={() => setMenuOpen(false)}>{t.nav.notes}</a>
              <a href="#about" onClick={() => setMenuOpen(false)}>{t.nav.about}</a>
              <a href={CALENDLY_URL || `mailto:${EMAIL}`} onClick={() => setMenuOpen(false)}>{t.nav.cta}</a>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className={`${wrap} pt-16 pb-16 md:pt-24 md:pb-24`} style={page}>
          <div className={HERO_LAYOUT === "columns" ? "grid lg:grid-cols-12 gap-10 lg:gap-16 items-end" : ""}>
            <div className={HERO_LAYOUT === "columns" ? "lg:col-span-8" : ""}>
              <h1 className="h1" style={{ maxWidth: HERO_LAYOUT === "columns" ? 760 : 1040 }}>
                {t.hero.h1a}<br />{t.hero.h1b}<span className="pen-under">{t.hero.h1mark}</span>{t.hero.h1c}
              </h1>
              <p className="mt-6 ink2" style={{ maxWidth: HERO_LAYOUT === "columns" ? 640 : 820 }}>{t.hero.sub}</p>
              <div className="mt-10 flex flex-wrap items-center gap-8 sm:gap-12">
                <CtaButton label={t.hero.cta} />
                <a href="#audit" className="link-action">{t.hero.secondary}</a>
              </div>
              {HERO_LAYOUT !== "columns" && <p className="mt-5 cap ink2">{t.hero.note}</p>}
            </div>
            {HERO_LAYOUT === "columns" && (
              <ul className="lg:col-span-4 cap ink2 space-y-2 border-t rule pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                {t.hero.creds.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
          </div>
          <div className="mt-14 md:mt-20" style={{ maxWidth: 1040 }}>
            <Demo d={t.demo} />
          </div>
        </section>

        {/* Sample audit */}
        <section id="audit" className="border-t rule">
          <div className={`${wrap} py-16 md:py-24`} style={page}>
            {THEME_ID === "grottesca2" && <div className="cap-label mb-3">01 / {t.eyebrow.audit}</div>}
            <h2 className="h2">{t.audit.title}</h2>
            <p className="mt-6 ink2" style={text}>{t.audit.lead}</p>
            <div className="mt-10" style={{ maxWidth: 1040 }}><AuditTable a={t.audit} /></div>
            <p className="mt-8" style={text}>{t.audit.after}</p>
          </div>
        </section>

        {/* Findings from real client work */}
        <section id="findings" className="border-t rule">
          <div className={`${wrap} py-16 md:py-24`} style={page}>
            {THEME_ID === "grottesca2" && <div className="cap-label mb-3">02 / {t.eyebrow.findings}</div>}
            <h2 className="h2">{t.findings.title}</h2>
            <p className="mt-6 ink2" style={text}>{t.findings.lead}</p>
            <div className="mt-12 space-y-10" style={{ maxWidth: 1040 }}>
              {t.findings.items.map((f) => <Finding key={f.n} f={f} t={t.findings} />)}
            </div>
            <p className="method-note" style={text}>
              <span className="badge badge-open">{t.findings.tagOpen}</span>{t.findings.method}
            </p>
          </div>
        </section>

        {/* Notes */}
        <section id="notes" className="border-t rule">
          <div className={`${wrap} py-16 md:py-24`} style={page}>
            {THEME_ID === "grottesca2" && <div className="cap-label mb-3">03 / {t.eyebrow.notes}</div>}
            <h2 className="h2">{t.notes.title}</h2>
            <div className="mt-10 grid md:grid-cols-3 gap-10 md:gap-8">
              {t.notes.items.map((n, i) => (
                <article key={i}>
                  <h3 className="h3"><span className="note-title">{n.h}</span></h3>
                  <p className="mt-4 ink2" style={{ fontSize: "1rem", lineHeight: 1.6 }}>{n.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Method: a real sequence, hence numbers */}
        <section className="border-t rule">
          <div className={`${wrap} py-16 md:py-24`} style={page}>
            {THEME_ID === "grottesca2" && <div className="cap-label mb-3">04 / {t.eyebrow.process}</div>}
            <h2 className="h2">{t.method.title}</h2>
            <ol className="mt-10 grid md:grid-cols-3 gap-8">
              {t.method.steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="step-n" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className="h3" style={{ fontWeight: 500 }}>{s.h}</h3>
                    <p className="mt-2 ink2" style={{ fontSize: "1rem", lineHeight: 1.6 }}>{s.p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t rule">
          <div className={`${wrap} py-16 md:py-24 grid md:grid-cols-12 gap-10 items-start`} style={page}>
            {PHOTO_SRC && (
              <div className="md:col-span-4 lg:col-span-3">
                <img src={PHOTO_SRC} alt={t.about.photoAlt} className="w-full aspect-square object-cover" style={{ borderRadius: 4 }} loading="lazy" />
              </div>
            )}
            {/* Without a photo the text takes the full width; no placeholder is shown. */}
            <div className={PHOTO_SRC ? "md:col-span-8 lg:col-span-7" : "md:col-span-9"}>
              {THEME_ID === "grottesca2" && <div className="cap-label mb-3">05 / {t.eyebrow.about}</div>}
              <h2 className="h2">{t.about.title}</h2>
              <p className="mt-6">{t.about.p1}</p>
              <p className="mt-4 ink2">{t.about.p2}</p>
              <p className="mt-4 ink2">{t.about.clients}</p>
              <p className="mt-6 cap">
                <a href={`mailto:${EMAIL}`} className="u">{EMAIL}</a><span className="ink2"> · </span>
                <a href={LINKEDIN} className="u" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="on-ink" style={{ background: "var(--ink)", color: "#fff" }}>
          <div className={`${wrap} py-16 md:py-24`} style={page}>
            <h2 className="h2" style={{ maxWidth: 760 }}>{t.cta.title}</h2>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <CtaButton label={t.cta.button} />
              <span className="cap" style={{ opacity: .8 }}>
                {t.cta.or} <a href={`mailto:${EMAIL}`} className="u">{EMAIL}</a>
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t rule">
        <div className={`${wrap} py-8 flex flex-wrap items-center justify-between gap-4 cap ink2`} style={page}>
          <span>© {new Date().getFullYear()} {t.footer.rights}</span>
          <span className="flex items-center gap-4">
            <a href="https://tradotext.com" className="u">tradotext.com</a>
            <a href={LINKEDIN} className="u" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
