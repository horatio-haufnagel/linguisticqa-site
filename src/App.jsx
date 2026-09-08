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

const CALENDLY_URL = "https://calendly.com/d/d2nc-6w9-njv"; // TODO
const SITE_URL = "https://linguisticqa.com"; // TODO: confirm canonical domain
const PHOTO_SRC = "/alessio.jpg";    // TODO: e.g. "/alessio.jpg"
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
    nav: { audit: "Sample audit", findings: "Findings", notes: "Notes", services: "Services", about: "About", cta: "Book a free audit", menu: "Menu" },
    eyebrow: { audit: "audit", findings: "findings", notes: "notes", process: "process", services: "services", about: "about" },
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
      lead: "Six typical errors, reconstructed to show the shape of a report. Each row is one string: what the model produced, why it fails, how severe it is, and what to do about it. A real report ranks issues by frequency and points at the cause (prompt, data or model), so the team knows what to fix first. Three findings from actual client work are below.",
      cols: ["Source", "Output", "Issue", "Severity", "Fix"],
      rows: [
        ["Sign in to continue.", "Firma per continuare.", "Mistranslation: “sign” read as signature. Meaning lost.", "Critical", "Accedi per continuare."],
        ["We'll get back to you shortly.", "Torneremo da te a breve.", "Calque. Grammatical, unnatural; reads machine-made.", "Major", "Ti rispondiamo a breve."],
        ["Please enter a valid email.", "Per favore inserisci una email valida.", "Register: “per favore” is spoken, not UI. Article: “un'email”.", "Minor", "Inserisci un'email valida."],
        ["Your subscription has been cancelled.", "Il tuo abbonamento è stato annullato.", "Terminology: “annullato” conflicts with product glossary (“disdetto”).", "Major", "Il tuo abbonamento è stato disdetto."],
        ["Hi Alex, welcome back!", "Ciao Alex, bentornato!", "Gender: masculine agreement on an unknown user.", "Major", "Ciao Alex, è bello rivederti!"],
        ["Learn more", "Impara di più", "Calque; “imparare” is to study. Standard UI term exists.", "Minor", "Scopri di più"],
      ],
      after: "Pattern across the sample: 4 of 6 issues are register or calque, not grammar. That points at the prompt, not the model. A cheaper fix than fine-tuning.",
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
          body: "The German source lists two consecutive rate bands in a two-item bullet list; the higher band carries double the fee. The second Italian bullet is not a translation of the second German rule. It is a near-verbatim paraphrase of the first (one verb changed), different enough to slip past a duplicate-text check, close enough to give the copy away. The stricter band, and its higher fee, simply do not exist in Italian.",
          why: "Both Italian bullets are grammatically flawless. Reading the Italian alone tells you nothing. You see it only by aligning the German list item by item and noticing that a number is gone.",
          verified: "Read the raw HTML around the point to confirm both items sit in the same list, rather than an artefact of my alignment script.",
          sev: "Critical: direct commercial impact on a published fee policy.",
          tag: "certain",
        },
        {
          n: "02",
          h: "Two translations of the same page, never reconciled",
          where: "Regulatory page in the seller help centre.",
          body: "Two independent Italian files existed for one German source: same title, same source date, same starting content. They do not differ by an oversight; they diverge systematically, as if produced by two people who never spoke.",
          table: [
            ["Procedure step", "Fase 1 / 2 / 3", "Passaggio 1 / 2 / 3"],
            ["Nationality", "mercato olandese", "mercato neerlandese"],
            ["WEEE acronym", "WEEE/AEEA", "RAEE"],
            ["Take-back scheme", "ritiro 1:1", "ritiro uno contro uno"],
            ["Closing formula", "Esclusione di responsabilità", "Disclaimer"],
          ],
          why: "One version pairs the English and Italian acronyms inside the same parenthesis, where the standard Italian term alone (RAEE) is correct and sufficient. One typo is an accident; two complete, independent translations in circulation is a process failure, and precisely what translation memories and locked glossaries exist to prevent. A reader comparing two help pages sees two legal vocabularies for one concept.",
          sev: "Major: terminology governance, not a single document.",
          tag: "certain",
        },
        {
          n: "03",
          h: "The link that vanished from one market",
          where: "Published seller case study on international expansion.",
          body: "The source names two markets in the same sentence, both as live links. The Italian keeps the link on the first and drops it on the second: same string, plain text, no anchor.",
          why: "I did not find this by reading. Both versions are grammatically and semantically identical. The structural element count between source and target did not match, 24 blocks against 23, and I traced the missing element by hand. It is the only one of the three found by structural diff rather than by reading, and it needs the tooling and the patience to compare HTML element by element instead of text line by line.",
          sev: "Minor: the Italian visitor loses a shortcut, nothing more.",
          tag: "certain",
        },
      ],
      method: "The same pass checked and discarded several other suspects: a VAT table across eight countries, a holiday calendar across six, a fee table across twelve product categories, nine country/IBAN pairs. All correct, line by line. Two structural count mismatches on other documents remain unresolved and are recorded as open, not as findings. The time spent ruling things out is the part of an audit nobody sees, and it is what separates a check from a list of suspicions.",
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
        { h: "Report", p: "Error taxonomy with severity, likely root cause, and concrete fixes." },
        { h: "Retainer", p: "Monthly review on a cadence, so regressions surface before release rather than in support tickets." },
      ],
    },
    services: {
      title: "Services",
      lead: "Each engagement delivers a concrete artefact: a report, a sign-off document, or a tested prompt set.",
      more: "Process & deliverables",
      close: "Close",
      headIdealFor: "Ideal for",
      headDeliverables: "What you receive",
      headProcess: "How a typical engagement works",
      headTimeline: "Typical timeline",
      items: [
        {
          n: "01",
          h: "Italian Model Output Audit",
          p: "Systematic review of your model's Italian output: error taxonomy, severity scoring, root causes and fixes. Delivered as a PDF report and corrected spreadsheet. An adversarial stress-test tier is available for high-stakes deployments.",
          detail: {
            idealFor: [
              "ML/NLP engineers who need precise diagnostics on Italian model quality before investing in fine-tuning",
              "Product managers at e-commerce or SaaS companies launching in Italy who need a report that justifies the decision to management",
              "Tech leads in fintech and marketplaces with compliance requirements who want documented evidence of review",
            ],
            what: [
              "PDF report: executive summary, findings by error category, root cause analysis, prioritization matrix",
              "CSV of all flagged strings: severity, issue type, suggested fix",
            ],
            steps: [
              { h: "Sampling and rubric", p: "You share 100 conversations or strings. I stratify the input and align the rubric to your use case: support, onboarding, legal copy, and so on." },
              { h: "Manual analysis", p: "Each item is reviewed on the rubric: register, terminology, gender default, cultural fit, UX clarity, compliance." },
              { h: "Pattern aggregation", p: "Findings are grouped by category and severity. Frequency counts show which error types are systemic and which are isolated." },
              { h: "Root cause and prioritisation", p: "Each pattern is traced to its likely source: prompt, training data, or model behaviour. The report tells your team where to fix, not only what is broken." },
            ],
            timeline: "Typically 12–13 working days from input delivery.",
            note: "Adversarial tier: adds targeted stress-testing of edge cases and safety-critical strings.",
          },
        },
        {
          n: "02",
          h: "Localization QA",
          p: "Pre-release QA review of all Italian-facing copy: UI strings, onboarding flows, email, legal text. Formal sign-off with documented evidence for audit trail and compliance.",
          detail: {
            idealFor: [
              "Product teams preparing the Italian launch of a consumer app who need documented sign-off before go-live",
              "Legal and compliance teams in fintech, insurance or e-commerce who need formal evidence of Italian text review for audit or certification",
              "Localization managers who received a translated file and want an independent review with evidence — not just a 'looks right'",
            ],
            what: [
              "QA report with findings by tier and severity",
              "Corrected strings in Excel: original, issue, fix, rationale",
              "Compliance note for legal and regulatory strings",
              "Formal sign-off document with documented evidence",
            ],
            steps: [
              { h: "Triage and deduplication", p: "Your file is cleaned and stratified. Identical or near-identical strings are grouped; a typical batch of 650 strings becomes ~480 unique review items." },
              { h: "Tiered review", p: "T1 (critical: payment, legal, destructive actions) is reviewed first, in full. T2 (errors, onboarding, account) follows. T3-4 strings are scanned for systematic patterns." },
              { h: "Findings and corrections", p: "Each issue is documented with severity, a concrete fix, and a rationale your team can use in future." },
              { h: "Sign-off", p: "A formal document records what was reviewed, what was found, and confirms the copy is cleared for release." },
            ],
            timeline: "Typically 15 working days from input delivery.",
          },
        },
        {
          n: "03",
          h: "Prompt Localization & Testing",
          p: "System prompt adaptation and validation so your model behaves correctly in Italian: register, terminology, and tone, tested against the interaction patterns your users will actually encounter.",
          detail: {
            idealFor: [
              "Product teams who built an English-first assistant or chatbot and need it to work correctly in Italian — not just translate it",
              "ML engineers integrating an LLM into an Italian product who see behaviour shift unexpectedly between EN and IT",
              "Conversational AI companies deploying an Italian customer service bot and need the system prompt validated against real interaction patterns",
            ],
            what: [
              "Tested prompt in final form",
              "Persona and tone guide: register, vocabulary scope, escalation rules",
              "Testing report with round-by-round results",
              "Monitoring checklist for ongoing quality checks",
            ],
            steps: [
              { h: "Comparative analysis", p: "The English source prompt is analysed instructionally, not translated word-for-word. Constructions that work in English often misfire in Italian; the goal is equivalent behaviour, not equivalent text." },
              { h: "Three versions", p: "V1 is a minimal adaptation. V2 adds tone calibration. V3 is the full version with conversation flow, persona rules and vocabulary constraints." },
              { h: "Testing rounds", p: "You run each version against a structured checklist. Up to three rounds of feedback are included; each round refines the prompt based on observed model behaviour." },
              { h: "Handover", p: "Final tested prompt, persona guide, and a monitoring checklist so your team can catch future drift without a full re-engagement." },
            ],
            timeline: "Typically 13 working days from input delivery.",
          },
        },
      ],
      retainer: {
        label: "Retention option",
        h: "Ongoing Monitoring Retainer",
        p: "Monthly sampling of live output, trend analysis against a baseline, and early warning when quality drifts — before your users notice. Attaches to any core service above.",
        detail: {
          idealFor: [
            "Any team that completed a core service and has continuous deployment or frequent releases — and does not want to wait for the next audit cycle to discover a regression",
            "Heads of AI or CTOs who want a systematic early warning on Italian quality before support tickets arrive",
          ],
          what: [
            "75 conversations sampled per month",
            "Monthly report against the Month 0 baseline",
            "Drift alerts when a category drops or a new pattern emerges",
          ],
          steps: [
            { h: "Baseline", p: "Month 0 of any core service establishes the baseline. Every subsequent month is measured against it." },
            { h: "Monthly sampling", p: "75 conversations are drawn from live output and reviewed against the same rubric used in the original audit." },
            { h: "Trend report", p: "A short monthly report shows where quality is stable, where it is drifting, and what the likely cause is." },
          ],
          note: "Available only as an add-on to a completed core service, not as a standalone engagement.",
        },
      },
      form: {
        nameLabel: "Name",
        emailLabel: "Email",
        messageLabel: "Anything else",
        messagePlaceholder: "Optional — deadline, context, or a specific question",
        submit: "Send request",
        submitting: "Sending…",
        success: "Received. I'll be in touch within one working day.",
        error: "Something went wrong — write to me directly:",
        ctaAsync: ["Request an audit", "Request a QA review", "Request prompt work", "Add monitoring"],
        ctaCalendly: "Prefer a call?",
        s01: [
          { name: "context", label: "Deployment context", options: ["Customer support", "Onboarding", "UI copy", "Other"] },
          { name: "volume", label: "Estimated volume", options: ["Under 100 conversations", "100–500", "Over 500"] },
          { name: "phase", label: "Project phase", options: ["Pre-launch", "Already in production"] },
        ],
        s02: [
          { name: "content-type", label: "Content type", options: ["UI strings", "Onboarding", "Email", "Legal text", "Mix"] },
          { name: "string-count", label: "Estimated string count", options: ["Under 300", "300–700", "Over 700"] },
          { name: "go-live", label: "Go-live timeline", options: ["Under 2 weeks", "2–4 weeks", "Over 4 weeks"] },
          { name: "compliance", label: "Formal sign-off needed?", options: ["Yes", "No", "Not sure"] },
        ],
        s03: [
          { name: "product-type", label: "Product type", options: ["Customer service bot", "AI assistant", "Other"] },
          { name: "prompt-status", label: "English prompt status", options: ["Already written", "In progress", "Not yet started"] },
          { name: "user-volume", label: "Target user volume", options: ["Internal tool", "Under 10k users", "10k+ users"] },
        ],
        retainer: [
          { name: "prior-service", label: "Prior or planned core service", options: ["Italian Model Output Audit", "Localization QA", "Prompt Localization & Testing", "None yet"] },
          { name: "cadence", label: "Release cadence", options: ["Continuous / daily", "Weekly", "Monthly", "Variable"] },
          { name: "monthly-volume", label: "Conversations per month", options: ["Under 500", "500–2,000", "Over 2,000"] },
        ],
      },
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
    nav: { audit: "Audit di esempio", findings: "Reperti", notes: "Note", services: "Servizi", about: "Chi sono", cta: "Prenota un audit gratuito", menu: "Menu" },
    eyebrow: { audit: "audit", findings: "reperti", notes: "note", process: "metodo", services: "servizi", about: "chi sono" },
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
      lead: "Sei errori tipici, ricostruiti per mostrare la forma di un report. Ogni riga è una stringa: cosa ha prodotto il modello, perché non va, quanto è grave, cosa fare. Un report reale ordina i problemi per frequenza e indica la causa (prompt, dati o modello), così il team sa cosa correggere per primo. Qui sotto tre reperti da lavoro reale.",
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
          body: "La sorgente tedesca definisce due fasce consecutive in un elenco puntato di due voci; la fascia superiore comporta una commissione doppia. La seconda voce italiana non è la traduzione della seconda regola tedesca: è una parafrasi quasi letterale della prima, con un solo verbo cambiato, abbastanza diversa da non far scattare un controllo automatico di duplicazione, abbastanza uguale da tradire la copia. La fascia più severa, e la sua commissione più alta, in italiano non esistono.",
          why: "Entrambe le voci italiane sono grammaticalmente perfette. Rileggere l'italiano da solo non rivela niente. Lo si vede solo allineando l'elenco tedesco voce per voce e accorgendosi che una soglia è scomparsa.",
          verified: "Ho letto l'HTML grezzo attorno al punto per confermare che le due voci appartengono allo stesso elenco e non sono un artefatto del mio script di allineamento.",
          sev: "Critica: impatto commerciale diretto su una politica tariffaria pubblicata.",
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
          why: "Una delle due versioni affianca l'acronimo inglese e quello italiano nella stessa parentesi, dove la sigla italiana normativa (RAEE) da sola è corretta e sufficiente. Un refuso è un incidente; due traduzioni complete e indipendenti in circolazione è un problema di processo, ed è esattamente lo scenario contro cui esistono le memorie di traduzione e i glossari vincolati. Chi confronta due pagine di assistenza vede due terminologie legali per lo stesso concetto.",
          sev: "Grave: governance terminologica, non singolo documento.",
          tag: "certain",
        },
        {
          n: "03",
          h: "Il collegamento che sparisce da un solo mercato",
          where: "Case study pubblicata su un rivenditore e la sua espansione internazionale.",
          body: "La sorgente cita due mercati nella stessa frase, entrambi come collegamenti attivi. L'italiano mantiene il link sul primo e lo perde sul secondo: stessa stringa, testo semplice, nessun tag.",
          why: "Non l'ho trovato leggendo: le due versioni sono grammaticalmente e semanticamente identiche. Il conteggio degli elementi strutturali tra sorgente e target non tornava (24 blocchi contro 23), e sono risalito a mano all'elemento mancante. È l'unico dei tre trovato per differenza strutturale invece che per lettura, e richiede gli strumenti e la pazienza per confrontare l'HTML elemento per elemento anziché il testo riga per riga.",
          sev: "Lieve: il visitatore italiano perde una scorciatoia, nulla di più.",
          tag: "certain",
        },
      ],
      method: "La stessa passata ha verificato e scartato diversi altri sospetti: una tabella IVA su otto paesi, un calendario festività su sei, una tabella tariffaria su dodici categorie merceologiche, nove coppie paese/IBAN. Tutti corretti, riga per riga. Due scarti di conteggio strutturale su altri documenti restano irrisolti e sono registrati come aperti, non come reperti. Il tempo speso a escludere è la parte di un audit che non si vede, ed è ciò che separa un controllo vero da un elenco di sospetti.",
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
        { h: "Report", p: "Tassonomia degli errori con gravità, causa probabile e correzioni concrete." },
        { h: "Retainer", p: "Revisione mensile a cadenza fissa, così le regressioni emergono prima del rilascio e non nei ticket di supporto." },
      ],
    },
    services: {
      title: "Servizi",
      lead: "Ogni collaborazione ha un output concreto: un report, un documento di approvazione, o un set di prompt testati.",
      more: "Processo e deliverable",
      close: "Chiudi",
      headIdealFor: "Ideale per",
      headDeliverables: "Cosa ricevi",
      headProcess: "Come funziona un incarico tipico",
      headTimeline: "Tempi indicativi",
      items: [
        {
          n: "01",
          h: "Italian Model Output Audit",
          p: "Revisione sistematica dell'output italiano del tuo modello: tassonomia degli errori, scoring per gravità, cause e correzioni. Consegnato come report PDF e foglio di calcolo corretto. Fascia stress-test avversariale disponibile per deployment ad alto rischio.",
          detail: {
            idealFor: [
              "ML/NLP engineer che cercano diagnostica puntuale sulla qualità del modello italiano prima di investire in fine-tuning",
              "Product manager di e-commerce o SaaS che lanciano in Italia e hanno bisogno di un report che giustifichi la decisione al management",
              "Leader tech in fintech e marketplace con vincoli di compliance che vogliono documentazione formale della revisione",
            ],
            what: [
              "Report PDF: executive summary, reperti per categoria d'errore, analisi delle cause, matrice di prioritizzazione",
              "CSV con tutte le stringhe segnalate: gravità, tipo di problema, correzione proposta",
            ],
            steps: [
              { h: "Campionamento e rubrica", p: "Condividi 100 conversazioni o stringhe. Stratifichiamo l'input e allineiamo la rubrica al tuo caso d'uso: assistenza clienti, onboarding, testi legali, e così via." },
              { h: "Analisi manuale", p: "Ogni voce è esaminata sulla rubrica: registro, terminologia, maschile per default, adeguatezza culturale, chiarezza UX e compliance." },
              { h: "Aggregazione dei pattern", p: "I reperti sono raggruppati per categoria e gravità. Il conteggio per frequenza mostra quali tipi di errore sono sistematici e quali isolati." },
              { h: "Cause e prioritizzazione", p: "Ogni pattern è ricondotto alla sua origine probabile: prompt, dati di addestramento o comportamento del modello. Il report dice al team dove intervenire, non solo cosa è rotto." },
            ],
            timeline: "Indicativamente 12–13 giorni lavorativi dalla consegna dell'input.",
            note: "Fascia avversariale: aggiunge stress-test mirati su casi limite e stringhe a rischio elevato.",
          },
        },
        {
          n: "02",
          h: "Localization QA",
          p: "QA pre-rilascio su tutto il copy in italiano: stringhe UI, flussi di onboarding, email, testi legali. Approvazione formale con evidenze documentate per audit trail e compliance.",
          detail: {
            idealFor: [
              "Team di prodotto che preparano il lancio italiano di un'app consumer e hanno bisogno di un'approvazione documentata prima del go-live",
              "Team legale o compliance in fintech, assicurazioni o e-commerce che devono dimostrare revisione formale dei testi italiani per audit o certificazioni",
              "Localization manager che hanno ricevuto il file tradotto e vogliono una revisione indipendente con evidenze — non solo un 'sembra giusto'",
            ],
            what: [
              "Report QA con reperti per fascia e gravità",
              "Stringhe corrette in Excel: originale, problema, correzione, motivazione",
              "Nota di compliance per stringhe legali e normative",
              "Documento di approvazione formale con evidenze documentate",
            ],
            steps: [
              { h: "Triage e deduplicazione", p: "Il file viene normalizzato e stratificato. Le stringhe identiche o quasi vengono raggruppate; un batch tipico di 650 stringhe diventa ~480 voci uniche da revisionare." },
              { h: "Revisione per fascia", p: "T1 (critica: pagamento, testi legali, azioni distruttive) viene revisionata per prima, integralmente. Segue T2 (errori, onboarding, gestione account). Le stringhe T3-4 vengono scansionate per pattern sistematici." },
              { h: "Reperti e correzioni", p: "Ogni problema è documentato con gravità, correzione concreta e motivazione riutilizzabile dal team in futuro." },
              { h: "Approvazione", p: "Un documento formale registra cosa è stato revisionato, cosa è stato trovato, e certifica che il copy è pronto per il rilascio." },
            ],
            timeline: "Indicativamente 15 giorni lavorativi dalla consegna dell'input.",
          },
        },
        {
          n: "03",
          h: "Prompt Localization & Testing",
          p: "Adattamento e validazione del system prompt perché il modello si comporti correttamente in italiano: registro, terminologia e tono, testati sui pattern di interazione che i tuoi utenti incontreranno effettivamente.",
          detail: {
            idealFor: [
              "Team di prodotto che hanno costruito un assistente o chatbot in inglese e devono farlo funzionare correttamente in italiano — non solo tradurlo",
              "ML engineer che integrano un LLM in un prodotto italiano e vedono il comportamento cambiare in modo non controllato tra EN e IT",
              "Aziende di AI conversazionale che deployano un bot italiano per customer service e hanno bisogno del system prompt validato sui pattern reali",
            ],
            what: [
              "Prompt testato nella forma definitiva",
              "Guida alla persona e al tono: registro, vocabolario, regole di escalation",
              "Report di test con i risultati per ogni ciclo",
              "Checklist di monitoraggio per controlli continuativi",
            ],
            steps: [
              { h: "Analisi comparativa", p: "Il prompt sorgente in inglese è analizzato sul piano istruzionale, non tradotto parola per parola. Costruzioni che funzionano in inglese spesso non reggono in italiano; l'obiettivo è un comportamento equivalente, non un testo equivalente." },
              { h: "Tre versioni", p: "V1 è un adattamento minimale. V2 aggiunge la calibrazione del tono. V3 è la versione completa con flusso conversazionale, regole di persona e vincoli di vocabolario." },
              { h: "Cicli di test", p: "Ogni versione viene testata su una checklist strutturata. Sono inclusi fino a tre cicli di feedback; ogni ciclo affina il prompt sulla base del comportamento osservato nel modello." },
              { h: "Consegna", p: "Prompt definitivo testato, guida alla persona e checklist di monitoraggio, perché il tuo team possa rilevare derive future senza riaprire un incarico completo." },
            ],
            timeline: "Indicativamente 13 giorni lavorativi dalla consegna dell'input.",
          },
        },
      ],
      retainer: {
        label: "Opzione di continuità",
        h: "Ongoing Monitoring Retainer",
        p: "Campionamento mensile dell'output live, analisi del trend rispetto alla baseline e segnalazione precoce quando la qualità deriva — prima che lo notino i tuoi utenti. Si aggiunge a qualunque servizio principale.",
        detail: {
          idealFor: [
            "Qualunque team uscito da un servizio principale con continuous deployment o rilasci frequenti, che non vuole aspettare il prossimo ciclo di audit per scoprire una regressione",
            "Head of AI o CTO che vuole un early warning sistematico sulla qualità italiana prima che arrivino i ticket di supporto",
          ],
          what: [
            "75 conversazioni campionate al mese",

            "Report mensile rispetto alla baseline del Mese 0",
            "Alert di deriva quando una categoria scende o emerge un nuovo pattern",
          ],
          steps: [
            { h: "Baseline", p: "Il Mese 0 di qualunque servizio principale stabilisce la baseline. Ogni mese successivo è misurato su di essa." },
            { h: "Campionamento mensile", p: "75 conversazioni vengono estratte dall'output live e revisionate con la stessa rubrica usata nell'audit originale." },
            { h: "Report di trend", p: "Un report mensile sintetico mostra dove la qualità è stabile, dove sta derivando e qual è la causa più probabile." },
          ],
          note: "Disponibile solo come aggiunta a un servizio principale completato, non come incarico autonomo.",
        },
      },
      form: {
        nameLabel: "Nome",
        emailLabel: "Email",
        messageLabel: "Altro",
        messagePlaceholder: "Facoltativo — scadenza, contesto o una domanda specifica",
        submit: "Invia richiesta",
        submitting: "Invio in corso…",
        success: "Ricevuto. Ti rispondo entro un giorno lavorativo.",
        error: "Qualcosa è andato storto — scrivimi direttamente:",
        ctaAsync: ["Richiedi un audit", "Richiedi una QA review", "Richiedi il lavoro sul prompt", "Aggiungi il monitoraggio"],
        ctaCalendly: "Preferisci una call?",
        s01: [
          { name: "context", label: "Contesto di deployment", options: ["Assistenza clienti", "Onboarding", "UI copy", "Altro"] },
          { name: "volume", label: "Volume stimato", options: ["Meno di 100 conversazioni", "100–500", "Oltre 500"] },
          { name: "phase", label: "Fase del progetto", options: ["Pre-lancio", "Già in produzione"] },
        ],
        s02: [
          { name: "content-type", label: "Tipo di contenuto", options: ["Stringhe UI", "Onboarding", "Email", "Testi legali", "Mix"] },
          { name: "string-count", label: "N° stringhe stimato", options: ["Meno di 300", "300–700", "Oltre 700"] },
          { name: "go-live", label: "Scadenza go-live", options: ["Meno di 2 settimane", "2–4 settimane", "Oltre 4 settimane"] },
          { name: "compliance", label: "Serve approvazione formale per compliance?", options: ["Sì", "No", "Non lo so"] },
        ],
        s03: [
          { name: "product-type", label: "Tipo di prodotto", options: ["Bot per customer service", "Assistente AI", "Altro"] },
          { name: "prompt-status", label: "Stato del prompt in inglese", options: ["Già scritto", "In corso", "Non ancora iniziato"] },
          { name: "user-volume", label: "Volume utenti target", options: ["Tool interno", "Meno di 10k utenti", "10k+ utenti"] },
        ],
        retainer: [
          { name: "prior-service", label: "Servizio principale già completato o pianificato", options: ["Italian Model Output Audit", "Localization QA", "Prompt Localization & Testing", "Nessuno ancora"] },
          { name: "cadence", label: "Cadenza di rilascio", options: ["Continuous / quotidiana", "Settimanale", "Mensile", "Variabile"] },
          { name: "monthly-volume", label: "Conversazioni italiane al mese", options: ["Meno di 500", "500–2.000", "Oltre 2.000"] },
        ],
      },
    },
    about: {
      title: "Chi revisiona",
      p1: "Alessio Di Rubbo. Madrelingua italiano, MA in Applied Linguistics all'Università di Vienna, lavoro da Vienna in tedesco e inglese.",
      p2: "Dal 2016 faccio post-editing e valutazione di output automatico per brand globali, tra cui attività di RLHF e SFT su modelli di traduzione in produzione per Translated e valutazione di NMT adattiva sul progetto ModernMT. Ho seguito il lancio italiano end-to-end del marketplace Kaufland. A un certo punto il lavoro è passato dal correggere errori allo spiegare perché succedono.",
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
    nav: { audit: "Beispiel-Audit", findings: "Befunde", notes: "Notizen", services: "Leistungen", about: "Über mich", cta: "Kostenloses Audit buchen", menu: "Menü" },
    eyebrow: { audit: "audit", findings: "befunde", notes: "notizen", process: "ablauf", services: "leistungen", about: "über mich" },
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
      lead: "Sechs typische Fehler, rekonstruiert, um die Form eines Reports zu zeigen. Jede Zeile ist ein String: was das Modell produziert hat, warum es scheitert, wie schwer, und was zu tun ist. Ein echter Report ordnet Probleme nach Häufigkeit und benennt die Ursache (Prompt, Daten oder Modell). Darunter drei Befunde aus echter Arbeit.",
      cols: ["Quelle", "Output", "Problem", "Schweregrad", "Korrektur"],
      rows: [
        ["Sign in to continue.", "Firma per continuare.", "Sinnfehler: „sign“ als Unterschrift gelesen.", "Kritisch", "Accedi per continuare."],
        ["We'll get back to you shortly.", "Torneremo da te a breve.", "Lehnübersetzung. Grammatisch, aber unnatürlich; klingt maschinell.", "Schwer", "Ti rispondiamo a breve."],
        ["Please enter a valid email.", "Per favore inserisci una email valida.", "Register: „per favore“ ist gesprochen, nicht UI. Artikel: „un'email“.", "Leicht", "Inserisci un'email valida."],
        ["Your subscription has been cancelled.", "Il tuo abbonamento è stato annullato.", "Terminologie: „annullato“ widerspricht dem Produktglossar („disdetto“).", "Schwer", "Il tuo abbonamento è stato disdetto."],
        ["Hi Alex, welcome back!", "Ciao Alex, bentornato!", "Genus: maskuline Kongruenz bei unbekanntem Nutzer.", "Schwer", "Ciao Alex, è bello rivederti!"],
        ["Learn more", "Impara di più", "Lehnübersetzung; „imparare“ heißt lernen. Standard-UI-Begriff existiert.", "Leicht", "Scopri di più"],
      ],
      after: "Muster in der Stichprobe: 4 von 6 Problemen sind Register oder Lehnübersetzung, nicht Grammatik. Das zeigt auf den Prompt, nicht auf das Modell. Eine günstigere Korrektur als Fine-Tuning.",
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
          body: "Die deutsche Quelle nennt zwei aufeinanderfolgende Staffeln in einer zweigliedrigen Aufzählung; die höhere Staffel kostet doppelt. Der zweite italienische Punkt ist keine Übersetzung der zweiten deutschen Regel, sondern eine fast wörtliche Paraphrase des ersten (ein Verb geändert), verschieden genug, um einer automatischen Dublettenprüfung zu entgehen, ähnlich genug, um die Kopie zu verraten. Die strengere Staffel und ihre höhere Gebühr existieren im Italienischen schlicht nicht.",
          why: "Beide italienischen Punkte sind grammatisch einwandfrei. Das Italienische allein zu lesen verrät nichts. Man sieht es nur, wenn man die deutsche Liste Punkt für Punkt abgleicht und bemerkt, dass eine Zahl fehlt.",
          verified: "Ich habe das rohe HTML rund um die Stelle gelesen, um zu bestätigen, dass beide Punkte in derselben Liste stehen und es kein Artefakt meines Alignment-Skripts ist.",
          sev: "Kritisch: direkte kommerzielle Auswirkung auf eine veröffentlichte Gebührenordnung.",
          tag: "certain",
        },
        {
          n: "02",
          h: "Zwei Übersetzungen derselben Seite, nie abgeglichen",
          where: "Regulatorische Seite im Händler-Hilfecenter.",
          body: "Für eine deutsche Quelle existierten zwei unabhängige italienische Dateien: gleicher Titel, gleiches Änderungsdatum, gleicher Ausgangstext. Sie unterscheiden sich nicht durch ein Versehen, sondern systematisch, als stammten sie von zwei Personen, die nie miteinander gesprochen haben.",
          table: [
            ["Verfahrensschritt", "Fase 1 / 2 / 3", "Passaggio 1 / 2 / 3"],
            ["Nationalitätsadjektiv", "mercato olandese", "mercato neerlandese"],
            ["WEEE-Akronym", "WEEE/AEEA", "RAEE"],
            ["Rücknahmeverfahren", "ritiro 1:1", "ritiro uno contro uno"],
            ["Schlussformel", "Esclusione di responsabilità", "Disclaimer"],
          ],
          why: "Eine der Versionen stellt das englische und das italienische Akronym in dieselbe Klammer, wo die italienische Normbezeichnung (RAEE) allein korrekt und ausreichend ist. Ein Tippfehler ist ein Unfall; zwei vollständige, unabhängige Übersetzungen im Umlauf sind ein Prozessfehler, und genau dagegen existieren Translation Memories und verbindliche Glossare. Wer zwei Hilfeseiten vergleicht, sieht zwei Rechtsterminologien für denselben Begriff.",
          sev: "Schwer: Terminologie-Governance, nicht ein einzelnes Dokument.",
          tag: "certain",
        },
        {
          n: "03",
          h: "Der Link, der aus einem Markt verschwindet",
          where: "Veröffentlichte Händler-Case-Study zur internationalen Expansion.",
          body: "Die Quelle nennt zwei Märkte im selben Satz, beide als aktive Links. Das Italienische behält den Link beim ersten und verliert ihn beim zweiten: gleiche Zeichenfolge, reiner Text, kein Anchor.",
          why: "Gefunden habe ich das nicht durch Lesen. Beide Fassungen sind grammatisch und semantisch identisch. Die Zahl der Strukturelemente stimmte zwischen Quelle und Ziel nicht überein, 24 Blöcke gegen 23, und ich habe das fehlende Element von Hand zurückverfolgt. Es ist der einzige der drei Befunde, der über einen strukturellen Abgleich statt über Lesen gefunden wurde.",
          sev: "Leicht: der italienische Besucher verliert nur eine Abkürzung.",
          tag: "certain",
        },
      ],
      method: "Derselbe Durchgang hat mehrere weitere Verdachtsfälle geprüft und verworfen: eine Mehrwertsteuertabelle über acht Länder, ein Feiertagskalender über sechs, eine Gebührentabelle über zwölf Produktkategorien, neun Land/IBAN-Paare. Alle korrekt, Zeile für Zeile. Zwei strukturelle Zähldifferenzen in anderen Dokumenten sind ungeklärt und als offen vermerkt, nicht als Befund. Die Zeit, die man mit dem Ausschließen verbringt, ist der Teil eines Audits, den niemand sieht.",
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
        { h: "Report", p: "Fehlertaxonomie mit Schweregrad, wahrscheinlicher Ursache und konkreten Korrekturen." },
        { h: "Retainer", p: "Monatliche Review im festen Rhythmus, damit Regressionen vor dem Release auffallen und nicht im Support." },
      ],
    },
    services: {
      title: "Leistungen",
      lead: "Drei Leistungen, jede mit einem konkreten Ergebnis, mit dem Ihr Team direkt arbeiten kann.",
      more: "Ablauf und Ergebnis",
      close: "Schließen",
      headIdealFor: "Geeignet für",
      headDeliverables: "Was Sie erhalten",
      headProcess: "Wie ein typischer Auftrag abläuft",
      headTimeline: "Richtzeitraum",
      items: [
        {
          n: "01",
          h: "Italian Model Output Audit",
          p: "Systematische Prüfung des italienischen Outputs Ihres Modells: Fehlertaxonomie, Schweregrad-Scoring, Ursachen und Korrekturen. Als PDF-Report und korrigierte Tabelle geliefert. Adversariales Stress-Test-Tier für hochkritische Deployments verfügbar.",
          detail: {
            idealFor: [
              "ML/NLP-Engineers, die eine präzise Diagnose der Qualität ihres italienischen Modells suchen, bevor sie in Fine-Tuning investieren",
              "Product Manager in E-Commerce oder SaaS, die in Italien launchen und einen Report brauchen, der die Entscheidung gegenüber dem Management belegt",
              "Tech-Leads in Fintech und auf Marktplätzen mit Compliance-Anforderungen, die dokumentierte Belege der Prüfung benötigen",
            ],
            what: [
              "PDF-Report: Executive Summary, Befunde nach Fehlerkategorie, Ursachenanalyse, Priorisierungsmatrix",
              "CSV aller markierten Strings: Schweregrad, Fehlertyp, Korrekturvorschlag",
            ],
            steps: [
              { h: "Sampling und Rubrik", p: "Sie übermitteln 100 Konversationen oder Strings. Der Input wird stratifiziert und die Rubrik auf Ihren Anwendungsfall abgestimmt: Support, Onboarding, Rechtstexte usw." },
              { h: "Manuelle Analyse", p: "Jede Einheit wird auf der Rubrik geprüft: Register, Terminologie, maskuliner Default, kulturelle Passung, UX-Klarheit und Compliance." },
              { h: "Musteraggregation", p: "Befunde werden nach Kategorie und Schweregrad gruppiert. Häufigkeitszählungen zeigen, welche Fehlertypen systematisch sind und welche vereinzelt auftreten." },
              { h: "Ursachen und Priorisierung", p: "Jedes Muster wird seiner wahrscheinlichen Quelle zugeordnet: Prompt, Trainingsdaten oder Modellverhalten. Der Report sagt Ihrem Team, wo zu beheben ist, nicht nur was defekt ist." },
            ],
            timeline: "In der Regel 12–13 Arbeitstage ab Eingang des Inputs.",
            note: "Adversariales Tier: gezielte Stresstests für Grenzfälle und sicherheitskritische Strings.",
          },
        },
        {
          n: "02",
          h: "Localization QA",
          p: "Pre-Release-QA für alle italienischsprachigen Texte: UI-Strings, Onboarding-Flows, E-Mails, Rechtstexte. Formale Freigabe mit dokumentierten Nachweisen für Audit Trail und Compliance.",
          detail: {
            idealFor: [
              "Produktteams, die den italienischen Launch einer Consumer-App vorbereiten und vor Go-Live eine dokumentierte Freigabe benötigen",
              "Rechts- und Compliance-Teams in Fintech, Versicherungen oder E-Commerce, die formale Nachweise der Prüfung italienischer Texte für Audit oder Zertifizierung brauchen",
              "Lokalisierungsmanager, die eine übersetzte Datei erhalten haben und eine unabhängige Prüfung mit Belegen wollen — nicht nur ein 'klingt richtig'",
            ],
            what: [
              "QA-Report mit Befunden nach Stufe und Schweregrad",
              "Korrigierte Strings in Excel: Original, Problem, Korrektur, Begründung",
              "Compliance-Notiz für rechtliche und regulatorische Strings",
              "Formales Freigabedokument mit dokumentierten Nachweisen",
            ],
            steps: [
              { h: "Triage und Deduplizierung", p: "Ihre Datei wird bereinigt und stratifiziert. Identische oder nahezu identische Strings werden gebündelt; ein typisches Batch von 650 Strings ergibt ~480 eindeutige Prüfeinheiten." },
              { h: "Stufenweise Prüfung", p: "T1 (kritisch: Zahlung, Rechtstexte, destruktive Aktionen) wird vollständig zuerst geprüft. T2 (Fehler, Onboarding, Konto) folgt. T3-4-Strings werden auf systematische Muster gescannt." },
              { h: "Befunde und Korrekturen", p: "Jedes Problem wird mit Schweregrad, konkreter Korrektur und einer Begründung dokumentiert, die Ihr Team künftig wiederverwenden kann." },
              { h: "Freigabe", p: "Ein formales Dokument hält fest, was geprüft wurde, was gefunden wurde, und bestätigt, dass der Text freigegeben ist." },
            ],
            timeline: "In der Regel 15 Arbeitstage ab Eingang des Inputs.",
          },
        },
        {
          n: "03",
          h: "Prompt Localization & Testing",
          p: "Anpassung und Validierung des System-Prompts, damit Ihr Modell auf Italienisch korrekt agiert: Register, Terminologie und Ton, validiert anhand der Interaktionsmuster, die Ihre Nutzer tatsächlich verwenden.",
          detail: {
            idealFor: [
              "Produktteams, die einen englischsprachigen Assistenten oder Chatbot gebaut haben und ihn auf Italienisch korrekt zum Laufen bringen müssen — nicht nur übersetzen",
              "ML-Engineers, die ein LLM in ein italienisches Produkt integrieren und unkontrollierte Verhaltensänderungen zwischen EN und IT beobachten",
              "Conversational-AI-Unternehmen, die einen italienischen Kundenservice-Bot deployen und den System-Prompt gegen reale Interaktionsmuster validieren müssen",
            ],
            what: [
              "Getesteter Prompt in Endfassung",
              "Persona- und Tonleitfaden: Register, Vokabular, Eskalationsregeln",
              "Testbericht mit Ergebnissen je Runde",
              "Monitoring-Checkliste für laufende Qualitätsprüfungen",
            ],
            steps: [
              { h: "Komparative Analyse", p: "Der englische Quell-Prompt wird instruktional analysiert, nicht wörtlich übersetzt. Konstruktionen, die auf Englisch funktionieren, verfehlen auf Italienisch oft ihr Ziel; gefragt ist äquivalentes Verhalten, nicht äquivalenter Text." },
              { h: "Drei Versionen", p: "V1 ist eine minimale Anpassung. V2 fügt Tonkalibrierung hinzu. V3 ist die vollständige Fassung mit Konversationsfluss, Persona-Regeln und Vokabularvorgaben." },
              { h: "Testrunden", p: "Jede Version wird anhand einer strukturierten Checkliste getestet. Bis zu drei Feedbackrunden sind enthalten; jede Runde verfeinert den Prompt auf Basis des beobachteten Modellverhaltens." },
              { h: "Übergabe", p: "Finaler getesteter Prompt, Persona-Leitfaden und Monitoring-Checkliste, damit Ihr Team künftige Drift erkennt, ohne eine vollständige Beauftragung neu zu starten." },
            ],
            timeline: "In der Regel 13 Arbeitstage ab Eingang des Inputs.",
          },
        },
      ],
      retainer: {
        label: "Kontinuitätsoption",
        h: "Ongoing Monitoring Retainer",
        p: "Monatliches Sampling des Live-Outputs, Trendanalyse gegen eine Baseline und Frühwarnung bei Qualitätsdrift — bevor Ihre Nutzer es bemerken. Kombinierbar mit jeder der Kernleistungen.",
        detail: {
          idealFor: [
            "Jedes Team nach einem Kernauftrag mit Continuous Deployment oder häufigen Releases, das nicht bis zum nächsten Audit-Zyklus warten will, um eine Regression zu entdecken",
            "Heads of AI oder CTOs, die ein systematisches Frühwarnsystem für die italienische Qualität wollen, bevor Support-Tickets eintreffen",
          ],
          what: [
            "75 Konversationen pro Monat gesampelt",
            "Monatsbericht gegen die Baseline aus Monat 0",
            "Drift-Alerts bei Kategorieabfall oder neuen Mustern",
          ],
          steps: [
            { h: "Baseline", p: "Monat 0 einer beliebigen Kernleistung legt die Baseline fest. Jeder Folgemonat wird daran gemessen." },
            { h: "Monatliches Sampling", p: "75 Konversationen werden aus dem Live-Output gezogen und mit derselben Rubrik des ursprünglichen Audits geprüft." },
            { h: "Trendbericht", p: "Ein kurzer Monatsbericht zeigt, wo die Qualität stabil ist, wo sie driftet und was die wahrscheinliche Ursache ist." },
          ],
          note: "Nur als Ergänzung zu einer abgeschlossenen Kernleistung buchbar, nicht als eigenständiger Auftrag.",
        },
      },
      form: {
        nameLabel: "Name",
        emailLabel: "E-Mail",
        messageLabel: "Sonstiges",
        messagePlaceholder: "Optional — Deadline, Kontext oder eine konkrete Frage",
        submit: "Anfrage senden",
        submitting: "Wird gesendet…",
        success: "Erhalten. Ich melde mich innerhalb eines Arbeitstages.",
        error: "Etwas ist schiefgelaufen — schreiben Sie mir direkt:",
        ctaAsync: ["Audit anfragen", "QA-Prüfung anfragen", "Prompt-Arbeit anfragen", "Monitoring hinzufügen"],
        ctaCalendly: "Lieber ein Gespräch?",
        s01: [
          { name: "context", label: "Deployment-Kontext", options: ["Kundensupport", "Onboarding", "UI-Texte", "Anderes"] },
          { name: "volume", label: "Geschätztes Volumen", options: ["Unter 100 Konversationen", "100–500", "Über 500"] },
          { name: "phase", label: "Projektphase", options: ["Vor dem Launch", "Bereits in Produktion"] },
        ],
        s02: [
          { name: "content-type", label: "Inhaltstyp", options: ["UI-Strings", "Onboarding", "E-Mail", "Rechtstexte", "Mix"] },
          { name: "string-count", label: "Geschätzte Stringanzahl", options: ["Unter 300", "300–700", "Über 700"] },
          { name: "go-live", label: "Go-live-Zeitplan", options: ["Unter 2 Wochen", "2–4 Wochen", "Über 4 Wochen"] },
          { name: "compliance", label: "Formale Freigabe für Compliance nötig?", options: ["Ja", "Nein", "Nicht sicher"] },
        ],
        s03: [
          { name: "product-type", label: "Produkttyp", options: ["Kundenservice-Bot", "KI-Assistent", "Anderes"] },
          { name: "prompt-status", label: "Status des englischen Prompts", options: ["Bereits geschrieben", "In Bearbeitung", "Noch nicht begonnen"] },
          { name: "user-volume", label: "Ziel-Nutzervolumen", options: ["Internes Tool", "Unter 10k Nutzer", "10k+ Nutzer"] },
        ],
        retainer: [
          { name: "prior-service", label: "Abgeschlossener oder geplanter Kernauftrag", options: ["Italian Model Output Audit", "Localization QA", "Prompt Localization & Testing", "Noch keiner"] },
          { name: "cadence", label: "Release-Kadenz", options: ["Continuous / täglich", "Wöchentlich", "Monatlich", "Variabel"] },
          { name: "monthly-volume", label: "Konversationen pro Monat", options: ["Unter 500", "500–2.000", "Über 2.000"] },
        ],
      },
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

  /* service cards: expand toggle and detail panel */
  .svc-toggle{display:inline-flex;align-items:center;gap:.35em;margin-top:1.1rem;font-family:var(--mono);
       font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;font-weight:500;color:var(--ink-2);
       background:transparent;border:0;padding:0;cursor:pointer;border-bottom:1px solid var(--rule)}
  .svc-toggle:hover{color:var(--ink);border-bottom-color:var(--ink)}
  article.svc-open{border-top-color:var(--pen)}
  article.svc-open .svc-toggle{color:var(--pen);border-bottom-color:var(--pen)}
  .svc-panel{padding-top:2rem;padding-bottom:2rem}
  .svc-what-list{list-style:none;padding:0;margin:0}
  .svc-what-list li{padding:.4rem 0 .4rem 1.3em;border-bottom:1px solid var(--rule);font-size:.92rem;
       line-height:1.55;color:var(--ink-2);position:relative}
  .svc-what-list li::before{content:"→";position:absolute;left:0;color:var(--pen);font-family:var(--mono);font-size:.85em}
  .svc-steps{list-style:none;padding:0;margin:0}
  .svc-steps li{display:flex;gap:.9rem;align-items:flex-start;padding-bottom:1rem;
       border-bottom:1px solid var(--rule);margin-bottom:1rem}
  .svc-steps li:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}
  .svc-detail-note{margin-top:1.2rem;font-size:.82rem;font-family:var(--mono);color:var(--ink-2);
       border-left:2px solid var(--rule);padding-left:.75rem;line-height:1.5}

  /* intake form */
  .svc-form-cta{margin-top:1.8rem;padding-top:1.5rem;border-top:1px solid var(--rule)}
  .svc-form{margin-top:1.5rem}
  .svc-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 2rem}
  @media(max-width:640px){.svc-form-grid{grid-template-columns:1fr}}
  .svc-form-field{margin-bottom:1.1rem}
  .svc-form-field label{display:block;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;
       text-transform:uppercase;color:var(--ink-2);margin-bottom:.35rem;font-weight:500}
  .svc-form-field input[type="text"],.svc-form-field input[type="email"],
  .svc-form-field select,.svc-form-field textarea{
       display:block;width:100%;background:transparent;border:none;
       border-bottom:1px solid var(--rule);padding:.4rem 0;font-family:var(--sans);
       font-size:.95rem;color:var(--ink);outline:none;border-radius:0;
       -webkit-appearance:none;appearance:none;line-height:1.5}
  .svc-form-field input:focus,.svc-form-field select:focus,.svc-form-field textarea:focus{border-bottom-color:var(--ink)}
  .svc-form-field textarea{resize:vertical;min-height:72px}
  .svc-form-field select{cursor:pointer}
  .svc-form-success{font-family:var(--mono);font-size:.88rem;color:var(--ok);
       border-left:2px solid var(--ok);padding-left:.75rem;line-height:1.5}
  .svc-form-error{font-size:.88rem;color:var(--pen);margin-top:.75rem}
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

function encode(data) {
  return Object.keys(data)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(data[k] ?? ""))
    .join("&");
}

function ServiceForm({ svcKey, formName, ctaLabel, t }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [status, setStatus] = useState("idle");

  const f = t.form;
  const fields = f[svcKey];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(v => ({ ...v, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("submitting");
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": formName, ...values }),
    })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  };

  if (status === "success") {
    return (
      <div className="svc-form-cta">
        <p className="svc-form-success">{f.success}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="svc-form-cta flex flex-wrap items-center gap-5">
        <button type="button" className="btn" style={{ padding: ".65rem 1.2rem", fontSize: ".95rem" }}
                onClick={() => setOpen(true)}>
          {ctaLabel}
        </button>
        <span className="cap ink2">
          {f.ctaCalendly}{" "}
          <a href={CALENDLY_URL} className="u" target="_blank" rel="noopener noreferrer">Calendly</a>
        </span>
      </div>
    );
  }

  return (
    <form className="svc-form" name={formName} onSubmit={handleSubmit}>
      <input type="hidden" name="form-name" value={formName} />
      <input type="hidden" name="bot-field" />
      <div className="svc-form-grid">
        <div className="svc-form-field">
          <label htmlFor={`${formName}-name`}>{f.nameLabel} *</label>
          <input id={`${formName}-name`} type="text" name="name" required onChange={handleChange} />
        </div>
        <div className="svc-form-field">
          <label htmlFor={`${formName}-email`}>{f.emailLabel} *</label>
          <input id={`${formName}-email`} type="email" name="email" required onChange={handleChange} />
        </div>
        {fields.map(field => (
          <div key={field.name} className="svc-form-field">
            <label htmlFor={`${formName}-${field.name}`}>{field.label}</label>
            <select id={`${formName}-${field.name}`} name={field.name} defaultValue="" onChange={handleChange}>
              <option value="" disabled>—</option>
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="svc-form-field" style={{ marginTop: ".25rem" }}>
        <label htmlFor={`${formName}-message`}>{f.messageLabel}</label>
        <textarea id={`${formName}-message`} name="message" placeholder={f.messagePlaceholder} onChange={handleChange} />
      </div>
      <div style={{ marginTop: "1rem" }} className="flex flex-wrap items-center gap-5">
        <button type="submit" className="btn" style={{ padding: ".65rem 1.2rem", fontSize: ".95rem" }}
                disabled={status === "submitting"}>
          {status === "submitting" ? f.submitting : f.submit}
        </button>
        <button type="button" className="svc-toggle" onClick={() => setOpen(false)}>
          {t.close}
        </button>
      </div>
      {status === "error" && (
        <p className="svc-form-error">
          {f.error}{" "}<a href={`mailto:${EMAIL}`} className="u">{EMAIL}</a>
        </p>
      )}
    </form>
  );
}

function ServiceDetail({ svc, t, svcKey, formName, ctaLabel }) {
  const d = svc.detail;
  const monoLabel = { fontSize: ".72rem", letterSpacing: ".12em", color: "var(--ink-2)", textTransform: "uppercase", fontWeight: 500, marginBottom: ".75rem" };
  return (
    <div>
      {d.idealFor && (
        <div style={{ marginBottom: "1.8rem" }}>
          <div className="mono" style={monoLabel}>{t.headIdealFor}</div>
          <ul className="svc-what-list">
            {d.idealFor.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      <div className="grid md:grid-cols-5 gap-8 md:gap-12">
        <div className="md:col-span-2">
          <div className="mono" style={monoLabel}>{t.headDeliverables}</div>
          <ul className="svc-what-list">
            {d.what.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          {d.timeline && (
            <div style={{ marginTop: "1.4rem" }}>
              <div className="mono" style={{ ...monoLabel, marginBottom: ".5rem" }}>{t.headTimeline}</div>
              <p className="mono" style={{ fontSize: ".88rem", lineHeight: 1.5 }}>{d.timeline}</p>
            </div>
          )}
          {d.note && <p className="svc-detail-note">{d.note}</p>}
        </div>
        <div className="md:col-span-3">
          <div className="mono" style={monoLabel}>{t.headProcess}</div>
          <ol className="svc-steps">
            {d.steps.map((s, i) => (
              <li key={i}>
                <span className="step-n" aria-hidden="true" style={{ paddingTop: 0, minWidth: "1.5ch" }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 500, lineHeight: 1.3, marginBottom: ".25rem" }}>{s.h}</div>
                  <p className="ink2" style={{ fontSize: ".95rem", lineHeight: 1.6, margin: 0 }}>{s.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <ServiceForm svcKey={svcKey} formName={formName} ctaLabel={ctaLabel} t={t} />
    </div>
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
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [selectedRetainer, setSelectedRetainer] = useState(false);
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
            <a href="#services" className="nav">{t.nav.services}</a>
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
              <a href="#services" onClick={() => setMenuOpen(false)}>{t.nav.services}</a>
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

        {/* Services */}
        <section id="services" className="border-t rule">
          <div className={`${wrap} py-16 md:py-24`} style={page}>
            {THEME_ID === "grottesca2" && <div className="cap-label mb-3">05 / {t.eyebrow.services}</div>}
            <h2 className="h2">{t.services.title}</h2>
            <p className="mt-4 ink2" style={text}>{t.services.lead}</p>
            <div className="mt-12" style={{ maxWidth: 1040 }}>
              <div className="grid md:grid-cols-3 items-start">
                {t.services.items.map((s, i) => (
                  <article key={i} className={`border-t rule pt-8 pb-8 md:pr-12 ${selectedSvc === i ? "svc-open" : ""}`}>
                    <div className="mono" style={{ fontSize: ".72rem", letterSpacing: ".12em", color: "var(--pen)", textTransform: "uppercase", fontWeight: 500 }}>{s.n}</div>
                    <h3 className="h3 mt-3" style={{ fontWeight: 600 }}>{s.h}</h3>
                    <p className="mt-4 ink2" style={{ fontSize: "1rem", lineHeight: 1.62 }}>{s.p}</p>
                    <button
                      type="button"
                      className="svc-toggle"
                      aria-expanded={selectedSvc === i}
                      aria-controls="svc-detail-panel"
                      onClick={() => setSelectedSvc(selectedSvc === i ? null : i)}
                    >
                      {selectedSvc === i ? t.services.close : t.services.more} {selectedSvc === i ? "↑" : "↓"}
                    </button>
                  </article>
                ))}
              </div>
              {selectedSvc !== null && (
                <div id="svc-detail-panel" className="svc-panel border-t rule" role="region" aria-label={t.services.items[selectedSvc].h}>
                  <div className="mono" style={{ fontSize: ".72rem", letterSpacing: ".12em", color: "var(--pen)", textTransform: "uppercase", fontWeight: 500, marginBottom: "1rem" }}>
                    {t.services.items[selectedSvc].n} / {t.services.items[selectedSvc].h}
                  </div>
                  <ServiceDetail
                    svc={t.services.items[selectedSvc]}
                    t={t.services}
                    svcKey={["s01","s02","s03"][selectedSvc]}
                    formName={["audit-brief","localization-qa-brief","prompt-brief"][selectedSvc]}
                    ctaLabel={t.services.form.ctaAsync[selectedSvc]}
                  />
                </div>
              )}
              <div className="border-t rule pt-8 pb-2 flex gap-5 flex-wrap">
                <span className="mono" style={{ fontSize: "1rem", color: "var(--ink-2)", fontWeight: 500, flexShrink: 0, lineHeight: 1.6 }}>→</span>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: ".72rem", letterSpacing: ".12em", color: "var(--ink-2)", textTransform: "uppercase", fontWeight: 500 }}>{t.services.retainer.label}</div>
                  <h3 className="h3 mt-2" style={{ fontWeight: 500 }}>{t.services.retainer.h}</h3>
                  <p className="mt-3 ink2" style={{ fontSize: "1rem", lineHeight: 1.62, maxWidth: 640 }}>{t.services.retainer.p}</p>
                  <button
                    type="button"
                    className="svc-toggle"
                    aria-expanded={selectedRetainer}
                    aria-controls="retainer-detail-panel"
                    onClick={() => setSelectedRetainer(v => !v)}
                  >
                    {selectedRetainer ? t.services.close : t.services.more} {selectedRetainer ? "↑" : "↓"}
                  </button>
                  {selectedRetainer && (
                    <div id="retainer-detail-panel" className="mt-6" role="region" aria-label={t.services.retainer.h}>
                      <ServiceDetail
                        svc={t.services.retainer}
                        t={t.services}
                        svcKey="retainer"
                        formName="retainer-brief"
                        ctaLabel={t.services.form.ctaAsync[3]}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              {THEME_ID === "grottesca2" && <div className="cap-label mb-3">06 / {t.eyebrow.about}</div>}
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
            <a href="https://linguisticqa.com" className="u">linguisticqa.com</a>
            <a href={LINKEDIN} className="u" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
