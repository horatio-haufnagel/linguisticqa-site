import { useState, useEffect, useMemo } from "react";

/* =========================================================================
   Alessio Di Rubbo: Italian localization, SEO/GEO and linguistic QA
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
    metaTitle: "Alessio Di Rubbo | Italian localization, SEO and GEO for DACH brands",
    metaDesc: "Italian localization, Italian SEO and GEO, and linguistic QA for brands and agencies in Austria, Germany and Switzerland selling to Italy. Native Italian, based in Vienna.",
    nav: { audit: "Sample review", findings: "Findings", notes: "Notes", services: "Services", resources: "Resources", about: "About", cta: "Book a free review", menu: "Menu" },
    eyebrow: { audit: "review", findings: "findings", notes: "notes", process: "process", services: "services", about: "about" },
    hero: {
      h1a: "Your brand already speaks Italian.",
      h1b: "I find where it sounds ",
      h1mark: "translated",
      h1c: ".",
      sub: "Italian localization and Italian SEO/GEO for brands and agencies in the DACH region selling to Italy. Texts that Italian customers read as written in Italian, and that hold up in Google as well as in the answers ChatGPT or Gemini give them.",
      cta: "Book a free review",
      secondary: "See a sample review",
      note: "Vienna. Remote, for brands and agencies in DACH and Italy.",
      creds: ["MA in Applied Linguistics, University of Vienna", "10+ years of EN/DE→IT localization for e-commerce and marketing", "End-to-end Italian launch of Kaufland's online marketplace", "Vienna · remote · EN, DE, IT"],
    },
    demo: {
      title: "One product text. Three problems a spell-checker won't see.",
      source: "Source · DE",
      output: "Italian version · IT",
      src: "Unsere Wanderschuhe sind wasserdicht und bieten auch auf langen Touren optimalen Halt. Jetzt bestellen und kostenlos zurücksenden.",
      out: ["Le nostre scarpe da escursionismo", " sono impermeabili e offrono anche nei tour lunghi ", "un appoggio ottimale", ". ", "Ordina ora e rispedisci gratuitamente", "."],
      notes: [
        { tag: "Search term", text: "Italians search for “scarpe da trekking”. “Scarpe da escursionismo” is correct Italian, but few people type it: the page misses the term that brings traffic." },
        { tag: "Calque", text: "“Optimaler Halt” carried over word for word. Native Italian product copy says the shoe “resta stabile”." },
        { tag: "Convention", text: "Italian shops write “Reso gratuito”. “Rispedisci gratuitamente” is understandable, and it reads as translated in the one line that should build trust." },
      ],
      footer: "A spell-checker finds nothing here. Your Italian customers notice all three problems. Google notices the first.",
    },
    audit: {
      title: "What a review looks like",
      lead: "Six typical issues, reconstructed to show the shape of a report. Each row is one piece of text: what the Italian version says, why it fails, how severe it is and what to write instead. A real report ranks issues by frequency and impact, so you know where to start. Further down: three findings from actual client work.",
      cols: ["Source", "Italian version", "Issue", "Severity", "Fix"],
      rows: [
        ["Widerrufsrecht", "Diritto di revoca", "Legal terminology: Italian consumer law calls it “diritto di recesso”. The wrong term in the terms of sale is a liability.", "Critical", "Diritto di recesso"],
        ["Sale", "Sale", "English loan left in place. In Italian “sale” means salt, and Italian shoppers search for “saldi”.", "Major", "Saldi"],
        ["Damen-Laufschuhe Bestseller", "Bestseller scarpe da corsa per signore", "Register and search term: “signore” sounds dated and nobody searches for it. The target term is “scarpe running donna”.", "Major", "Scarpe running donna più vendute"],
        ["FAQ: Is the jacket waterproof?", "La giacca è waterproof?", "Anglicism in an FAQ. AI assistants often quote FAQs almost verbatim, so the anglicism ends up in the answer your customer reads.", "Major", "La giacca è impermeabile?"],
        ["Versandkostenfrei ab 50 €", "Spedizione senza costi da 50 €", "Calque. Italian shops use a fixed formula for this.", "Minor", "Spedizione gratuita sopra i 50 €"],
        ["Hi Anna, your order is on its way!", "Ciao Anna, il tuo ordine è sulla sua strada!", "Literal calque, close to meaningless in Italian.", "Major", "Ciao Anna, il tuo ordine è in arrivo!"],
      ],
      after: "Pattern across the sample: none of the six is a spelling or grammar mistake. Two cost you search traffic, one is a legal risk, and three make the shop read as translated.",
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
      title: "Notes on Italian for DACH brands",
      items: [
        { h: "Translated keywords are not keywords", p: "A keyword list translated from German gives you terms that are correct and rarely searched. Italian search has its own habits: sometimes English where German uses German (“scarpe running” for “Laufschuhe”), sometimes the other way round. Keyword research has to start again in Italian, from what people actually type." },
        { h: "Du, Sie, tu, Lei", p: "Many German brands move from “Sie” to “du” as a brand decision. In Italian, “tu” is the norm for consumer brands, but a shop with “tu” on the product pages and “Lei” in the terms of sale reads like two different companies. The register has to be decided once, written down and kept." },
        { h: "AI assistants quote what you wrote", p: "When ChatGPT, Gemini or Perplexity answer an Italian question about your product, they build the answer from text they find, often your own pages. A calque on your site turns into a calque in the answer, now presented as neutral advice. GEO in Italian starts with Italian worth quoting." },
      ],
    },
    method: {
      title: "How it works",
      steps: [
        { h: "Free review", p: "You book a 30-minute call and send me one Italian page (a product page, a landing page, a category text) at least three working days before it. I review it in advance, and in the call I show you what a native reader notices and whether it looks systematic." },
        { h: "Proposal", p: "If there is work worth doing, you get a written proposal with scope, deliverables, timeline and price." },
        { h: "Project or ongoing", p: "A one-off project, or a monthly slot for brands that publish Italian content regularly." },
      ],
    },
    services: {
      title: "Services",
      lead: "Italian is the only target language I work in. Each engagement ends with something your team can use straight away, from publish-ready Italian pages to a QA report with sign-off.",
      more: "Process & deliverables",
      close: "Close",
      headIdealFor: "Ideal for",
      headDeliverables: "What you receive",
      headProcess: "How a typical engagement works",
      headTimeline: "Typical timeline",
      items: [
        {
          n: "01",
          h: "Italian Localization",
          p: "DE/EN→IT localization of shop and product pages, websites, campaigns, newsletters and UI. Written for Italian readers, with a glossary and style guide so your brand voice stays consistent across pages and releases.",
          detail: {
            idealFor: [
              "Marketing and e-commerce leads at DACH brands entering or growing in Italy, who need Italian that sells rather than Italian that is merely correct",
              "Brands with an Italian site that was translated once and never looked at again",
              "Agencies that need a reliable Italian specialist for client projects (white-label available)",
            ],
            what: [
              "Localized Italian content, ready to publish or delivered in your CAT tool or TMS",
              "Italian glossary and style guide: register, key terms, brand voice",
              "Notes on cultural or legal points that need a decision on your side",
            ],
            steps: [
              { h: "Briefing", p: "Audience, tone, existing material and keyword priorities. If you already have a German or English style guide, I adapt it rather than start from scratch." },
              { h: "Glossary and register", p: "Key terms and the tu/Lei decision are fixed before the first page, so they don't drift between pages or releases." },
              { h: "Localization", p: "Texts are written for Italian readers, not mapped sentence by sentence. Where a claim, a unit or a convention doesn't carry over, I flag it." },
              { h: "Review and handover", p: "A second pass against source and glossary, then delivery in the format your team works with." },
            ],
            timeline: "Agreed per project, based on volume and deadline.",
          },
        },
        {
          n: "02",
          h: "Italian SEO & GEO",
          p: "Italian keyword research and on-page work for your localized pages, plus a review of how ChatGPT, Gemini and Perplexity describe your brand in Italian. Getting cited is a technical problem. Getting cited in good Italian is a linguistic one, and that is the part I handle.",
          detail: {
            idealFor: [
              "DACH brands whose Italian pages are live but bring little organic traffic from Italy",
              "SEO and GEO agencies that cover the technical side and need a native Italian specialist for keywords, content and AI answers",
              "Marketing teams who want to know what AI assistants tell Italian customers about their products",
            ],
            what: [
              "Italian keyword map: search terms per page, with intent and priority",
              "Rewritten titles, meta descriptions, headings and FAQs, or recommendations for your team",
              "AI answer review: Italian questions put to the main assistants, with each answer assessed for accuracy, language and brand voice",
            ],
            steps: [
              { h: "Scope", p: "Which pages and products matter, who you compete with in Italy, and which questions Italian customers actually ask." },
              { h: "Italian keyword research", p: "Starting from Italian search behaviour, not from translated German keywords." },
              { h: "On-page work", p: "Titles, descriptions, headings, FAQs and body copy adjusted to the keyword map, without losing the brand voice." },
              { h: "AI answer review", p: "I put your customers' questions to the main AI assistants in Italian and record what they say about you: wrong facts, outdated information, calques, tone. Each issue is linked to the page it most likely comes from." },
            ],
            timeline: "Agreed per project, based on the number of pages and markets.",
            note: "Included: the language-related technical checks (hreflang, Italian URLs and slugs, Italian metadata and structured data text). Site-wide technical SEO (indexing, site speed, server setup) stays with your developer or agency.",
          },
        },
        {
          n: "03",
          h: "Italian Linguistic QA",
          p: "Independent review of Italian content before or after release: agency translations, machine-translated or AI-generated text, legal and checkout copy. Findings by severity, corrected text and documented sign-off.",
          detail: {
            idealFor: [
              "Localization or content managers who received an Italian delivery and want an independent review with evidence, not just a “looks fine”",
              "Brands that produce Italian content with machine translation or AI and want to know whether it holds up",
              "Legal and compliance teams in e-commerce, fintech or insurance who need documented review of Italian texts",
            ],
            what: [
              "QA report with findings by tier and severity",
              "Corrected text in Excel: original, issue, fix, rationale",
              "Compliance note for legal and regulatory text",
              "Formal sign-off document",
            ],
            steps: [
              { h: "Triage and deduplication", p: "Your file is cleaned and stratified. Identical or near-identical strings are grouped: a typical batch of 650 strings becomes about 480 unique review items." },
              { h: "Tiered review", p: "Critical content (payment, legal, checkout) is reviewed first and in full. Account, onboarding and product content follow. Low-risk content is scanned for systematic patterns." },
              { h: "Findings and corrections", p: "Each issue is documented with severity, a concrete fix and a rationale your team can reuse." },
              { h: "Sign-off", p: "A formal document records what was reviewed and what was found, and confirms the Italian is cleared for release." },
            ],
            timeline: "Typically 15 working days from input delivery.",
          },
        },
      ],
      retainer: {
        label: "Collaboration model",
        h: "White-label for agencies",
        p: "Translation, SEO and marketing agencies can offer Italian under their own name. I work inside your process and tools, deliver to your project managers and don't contact your clients unless you ask me to. Available for all three services above.",
        detail: {
          idealFor: [
            "Agencies in Austria, Germany and Switzerland with clients selling to Italy but no in-house Italian specialist",
            "SEO and GEO agencies that want to cover Italian without hiring for it",
          ],
          what: [
            "Deliveries under your brand, in your templates",
            "NDA as standard",
            "One fixed contact for Italian across your projects",
          ],
          steps: [
            { h: "Intro call", p: "Your clients, your tools, your quality requirements and how you brief freelancers." },
            { h: "Test project", p: "A small job on real content, so you can judge the quality before committing to anything." },
            { h: "Ongoing collaboration", p: "Projects as they come, or a reserved monthly capacity if your Italian volume is regular." },
          ],
          note: "Agency rates on request.",
        },
      },
      form: {
        nameLabel: "Name",
        emailLabel: "Email",
        messageLabel: "Anything else",
        messagePlaceholder: "Optional: deadline, context, a link to the pages, or a specific question",
        submit: "Send request",
        submitting: "Sending…",
        success: "Received. I'll be in touch within one working day.",
        error: "Something went wrong. Write to me directly:",
        ctaAsync: ["Request localization", "Request SEO/GEO work", "Request a QA review", "Talk about white-label"],
        ctaCalendly: "Prefer a call?",
        s01: [
          { name: "content-type", label: "Content type", options: ["Shop and product pages", "Website", "Campaigns and newsletters", "UI / app", "Other"] },
          { name: "source-language", label: "Source language", options: ["German", "English", "Both"] },
          { name: "volume", label: "Estimated volume", options: ["Under 5,000 words", "5,000–20,000 words", "Over 20,000 words", "Not sure"] },
        ],
        s02: [
          { name: "italian-site", label: "Italian site", options: ["Already live", "In preparation", "Not yet"] },
          { name: "focus", label: "Main interest", options: ["Keyword research", "On-page optimization", "AI answer review", "Not sure yet"] },
          { name: "pages", label: "Number of pages", options: ["Under 20", "20–100", "Over 100"] },
        ],
        s03: [
          { name: "content-type", label: "What needs reviewing", options: ["Agency translation", "Machine-translated or AI-generated", "Legal and checkout text", "Mix"] },
          { name: "volume", label: "Estimated volume", options: ["Under 3,000 words", "3,000–10,000 words", "Over 10,000 words"] },
          { name: "go-live", label: "Go-live timeline", options: ["Under 2 weeks", "2–4 weeks", "Over 4 weeks", "Already live"] },
          { name: "compliance", label: "Formal sign-off needed?", options: ["Yes", "No", "Not sure"] },
        ],
        retainer: [
          { name: "agency-type", label: "Type of agency", options: ["Translation / localization", "SEO / GEO", "Marketing / content", "Other"] },
          { name: "need", label: "What you need in Italian", options: ["Localization", "SEO/GEO", "QA", "More than one"] },
          { name: "frequency", label: "How often", options: ["One project", "Occasionally", "Regularly"] },
        ],
      },
    },
    about: {
      title: "Who you'll work with",
      p1: "Alessio Di Rubbo. Native Italian, MA in Applied Linguistics from the University of Vienna, working from Vienna in German and English.",
      p2: "Since 2015 I've localized marketing, e-commerce and technical content from German and English into Italian, directly and through agencies such as Translated and Tolq. I ran the end-to-end Italian launch of Kaufland's online marketplace, including the Italian style guide and glossary. Most Italian that doesn't work isn't wrong. It was simply never written for an Italian reader, and that is the gap I close.",
      clients: "Brands I've worked on, directly or through agencies: Amazon, NVIDIA, Kaufland, Stellantis, Swarovski, Sixt.",
      photoAlt: "Alessio Di Rubbo",
    },
    cta: { title: "Send me one Italian page. I'll tell you what a native reader notices.", button: "Book a free review", or: "or write to" },
    footer: { rights: "Alessio Di Rubbo · Vienna, Austria", lang: "Language" },
  },

  it: {
    htmlLang: "it",
    metaTitle: "Alessio Di Rubbo | Localizzazione italiana, SEO e GEO per brand DACH",
    metaDesc: "Localizzazione in italiano, SEO e GEO in italiano e linguistic QA per brand e agenzie di Austria, Germania e Svizzera che vendono in Italia. Madrelingua italiano, con sede a Vienna.",
    nav: { audit: "Revisione di esempio", findings: "Reperti", notes: "Note", services: "Servizi", resources: "Risorse", about: "Chi sono", cta: "Prenota una revisione gratuita", menu: "Menu" },
    eyebrow: { audit: "revisione", findings: "reperti", notes: "note", process: "metodo", services: "servizi", about: "chi sono" },
    hero: {
      h1a: "Il tuo brand parla già italiano.",
      h1b: "Io trovo dove suona ",
      h1mark: "tradotto",
      h1c: ".",
      sub: "Localizzazione in italiano e SEO/GEO in italiano per brand e agenzie dell'area DACH che vendono in Italia. Testi che il pubblico italiano legge come nati in italiano, e che reggono su Google come nelle risposte di ChatGPT o Gemini.",
      cta: "Prenota una revisione gratuita",
      secondary: "Guarda una revisione di esempio",
      note: "Vienna. Da remoto, per brand e agenzie in area DACH e in Italia.",
      creds: ["MA in Applied Linguistics, Università di Vienna", "Oltre 10 anni di localizzazione EN/DE→IT per e-commerce e marketing", "Lancio italiano end-to-end del marketplace online di Kaufland", "Vienna · remoto · EN, DE, IT"],
    },
    demo: {
      title: "Un testo prodotto. Tre problemi che il correttore ortografico non vede.",
      source: "Sorgente · DE",
      output: "Versione italiana · IT",
      src: "Unsere Wanderschuhe sind wasserdicht und bieten auch auf langen Touren optimalen Halt. Jetzt bestellen und kostenlos zurücksenden.",
      out: ["Le nostre scarpe da escursionismo", " sono impermeabili e offrono anche nei tour lunghi ", "un appoggio ottimale", ". ", "Ordina ora e rispedisci gratuitamente", "."],
      notes: [
        { tag: "Termine di ricerca", text: "Chi compra in Italia cerca «scarpe da trekking». «Scarpe da escursionismo» è italiano corretto, ma lo digitano in pochi: la pagina manca il termine che porta traffico." },
        { tag: "Calco", text: "«Optimaler Halt» reso parola per parola. Un testo prodotto nativo direbbe che la scarpa «resta stabile»." },
        { tag: "Convenzione", text: "Gli e-commerce italiani scrivono «Reso gratuito». «Rispedisci gratuitamente» è comprensibile, ma suona tradotto proprio nella riga che deve dare fiducia." },
      ],
      footer: "Il correttore ortografico qui non trova niente. I tuoi clienti italiani notano tutti e tre i problemi. Google nota il primo.",
    },
    audit: {
      title: "Com'è fatta una revisione",
      lead: "Sei problemi tipici, ricostruiti per mostrare la forma di un report. Ogni riga è un elemento di testo: cosa dice la versione italiana, perché non funziona, quanto è grave e cosa scrivere al suo posto. Un report reale ordina i problemi per frequenza e impatto, così sai da dove partire. Più sotto trovi tre reperti da lavoro reale.",
      cols: ["Sorgente", "Versione italiana", "Problema", "Gravità", "Correzione"],
      rows: [
        ["Widerrufsrecht", "Diritto di revoca", "Terminologia giuridica: il Codice del consumo parla di «diritto di recesso». Il termine sbagliato nelle condizioni di vendita è un rischio legale.", "Critico", "Diritto di recesso"],
        ["Sale", "Sale", "Prestito inglese lasciato com'è. In italiano «sale» è il sale da cucina, e chi compra cerca «saldi».", "Grave", "Saldi"],
        ["Damen-Laufschuhe Bestseller", "Bestseller scarpe da corsa per signore", "Registro e termine di ricerca: «signore» suona datato e nessuno lo cerca. Il termine da presidiare è «scarpe running donna».", "Grave", "Scarpe running donna più vendute"],
        ["FAQ: Is the jacket waterproof?", "La giacca è waterproof?", "Anglicismo in una FAQ. Gli assistenti AI citano spesso le FAQ quasi alla lettera, e l'anglicismo finisce nella risposta che legge il tuo cliente.", "Grave", "La giacca è impermeabile?"],
        ["Versandkostenfrei ab 50 €", "Spedizione senza costi da 50 €", "Calco. Gli e-commerce italiani usano una formula fissa.", "Lieve", "Spedizione gratuita sopra i 50 €"],
        ["Hi Anna, your order is on its way!", "Ciao Anna, il tuo ordine è sulla sua strada!", "Calco letterale, quasi privo di senso in italiano.", "Grave", "Ciao Anna, il tuo ordine è in arrivo!"],
      ],
      after: "Il quadro del campione: nessuno dei sei è un errore di ortografia o di grammatica. Due ti costano traffico organico, uno è un rischio legale, tre fanno sembrare tradotto il negozio.",
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
      title: "Note sull'italiano per i brand DACH",
      items: [
        { h: "Le keyword tradotte non sono keyword", p: "Una lista di keyword tradotta dal tedesco produce termini corretti che quasi nessuno cerca. Chi cerca in italiano ha abitudini sue: a volte usa l'inglese dove il tedesco usa il tedesco («scarpe running» per «Laufschuhe»), a volte il contrario. La ricerca delle keyword va rifatta in italiano, partendo da ciò che le persone scrivono davvero." },
        { h: "Du, Sie, tu, Lei", p: "Molti brand tedeschi passano dal «Sie» al «du» per scelta di marca. In italiano il «tu» è la norma per i brand consumer, ma un negozio con il «tu» nelle schede prodotto e il «Lei» nelle condizioni di vendita sembra due aziende diverse. Il registro va deciso una volta, messo per iscritto e mantenuto." },
        { h: "Gli assistenti AI citano quello che hai scritto", p: "Quando ChatGPT, Gemini o Perplexity rispondono in italiano a una domanda sul tuo prodotto, costruiscono la risposta dai testi che trovano, spesso le tue pagine. Un calco sul tuo sito diventa un calco nella risposta, presentato come un consiglio neutro. Il GEO in italiano comincia da un italiano che valga la pena citare." },
      ],
    },
    method: {
      title: "Come funziona",
      steps: [
        { h: "Revisione gratuita", p: "Prenoti una call di 30 minuti e mi mandi una pagina in italiano (una scheda prodotto, una landing page, un testo di categoria) almeno tre giorni lavorativi prima. La analizzo in anticipo e nella call ti mostro cosa nota un lettore madrelingua e se i problemi sembrano sistematici." },
        { h: "Proposta", p: "Se c'è un lavoro che vale la pena fare, ricevi una proposta scritta con perimetro, deliverable, tempi e prezzo." },
        { h: "Progetto o continuità", p: "Un progetto singolo, oppure uno spazio mensile per i brand che pubblicano contenuti in italiano con regolarità." },
      ],
    },
    services: {
      title: "Servizi",
      lead: "Lavoro solo verso l'italiano. Ogni incarico si chiude con qualcosa che il tuo team può usare subito, dalle pagine italiane pronte da pubblicare a un report QA con approvazione formale.",
      more: "Processo e deliverable",
      close: "Chiudi",
      headIdealFor: "Ideale per",
      headDeliverables: "Cosa ricevi",
      headProcess: "Come funziona un incarico tipico",
      headTimeline: "Tempi indicativi",
      items: [
        {
          n: "01",
          h: "Localizzazione in italiano",
          p: "Localizzazione DE/EN→IT di negozi online e schede prodotto, siti, campagne, newsletter e interfacce. Testi scritti per chi legge in italiano, con glossario e guida di stile che tengono coerente la voce del brand tra pagine e rilasci.",
          detail: {
            idealFor: [
              "Responsabili marketing ed e-commerce di brand DACH che entrano o crescono in Italia e hanno bisogno di un italiano che vende, non solo di un italiano corretto",
              "Brand con un sito italiano tradotto una volta e poi mai più rivisto",
              "Agenzie che cercano uno specialista italiano affidabile per i progetti dei clienti (anche in white-label)",
            ],
            what: [
              "Contenuti localizzati in italiano, pronti da pubblicare o consegnati nel tuo CAT tool o TMS",
              "Glossario e guida di stile italiani: registro, termini chiave, voce del brand",
              "Note sui punti culturali o legali che richiedono una tua decisione",
            ],
            steps: [
              { h: "Briefing", p: "Pubblico, tono, materiali esistenti e priorità di keyword. Se hai già una guida di stile in tedesco o in inglese, la adatto invece di ripartire da zero." },
              { h: "Glossario e registro", p: "Fisso i termini chiave e la scelta tra tu e Lei prima della prima pagina, così non cambiano tra una pagina e l'altra o tra un rilascio e l'altro." },
              { h: "Localizzazione", p: "Scrivo per chi legge in italiano, senza ricalcare la sorgente frase per frase. Se un claim, un'unità di misura o una convenzione non funziona in Italia, te lo segnalo." },
              { h: "Revisione e consegna", p: "Un secondo passaggio su sorgente e glossario, poi la consegna nel formato con cui lavora il tuo team." },
            ],
            timeline: "Da concordare per ogni progetto, in base a volume e scadenza.",
          },
        },
        {
          n: "02",
          h: "SEO e GEO in italiano",
          p: "Ricerca keyword in italiano e ottimizzazione on-page delle pagine localizzate, più una verifica di come ChatGPT, Gemini e Perplexity descrivono il tuo brand in italiano. Farsi citare è un problema tecnico. Farsi citare in un buon italiano è un problema linguistico, ed è la parte di cui mi occupo io.",
          detail: {
            idealFor: [
              "Brand DACH con pagine italiane online che portano poco traffico organico dall'Italia",
              "Agenzie SEO e GEO che coprono la parte tecnica e cercano uno specialista madrelingua per keyword, contenuti e risposte AI",
              "Team marketing che vogliono sapere cosa raccontano gli assistenti AI ai clienti italiani sui loro prodotti",
            ],
            what: [
              "Mappa delle keyword in italiano: termini di ricerca per pagina, con intento e priorità",
              "Title, meta description, titoli e FAQ riscritti, oppure raccomandazioni per il tuo team",
              "Verifica delle risposte AI: domande in italiano poste ai principali assistenti, con ogni risposta valutata per correttezza, lingua e voce del brand",
            ],
            steps: [
              { h: "Perimetro", p: "Quali pagine e quali prodotti contano, con chi competi in Italia e quali domande fanno davvero i clienti italiani." },
              { h: "Ricerca keyword in italiano", p: "Parto dalle abitudini di ricerca italiane, non dalle keyword tedesche tradotte." },
              { h: "Lavoro on-page", p: "Title, description, titoli, FAQ e testi allineati alla mappa delle keyword, senza perdere la voce del brand." },
              { h: "Verifica delle risposte AI", p: "Pongo in italiano ai principali assistenti AI le domande dei tuoi clienti e registro cosa dicono di te: dati sbagliati o superati, calchi, tono. Ogni problema è collegato alla pagina da cui con ogni probabilità deriva." },
            ],
            timeline: "Da concordare per ogni progetto, in base al numero di pagine e mercati.",
            note: "Inclusi i controlli tecnici legati alla lingua (hreflang, URL e slug in italiano, metadati e testi dei dati strutturati in italiano). La SEO tecnica del sito nel suo insieme (indicizzazione, velocità, configurazione del server) resta al tuo sviluppatore o alla tua agenzia.",
          },
        },
        {
          n: "03",
          h: "Linguistic QA in italiano",
          p: "Revisione indipendente dei contenuti italiani prima o dopo il rilascio: traduzioni di agenzia, testi tradotti automaticamente o generati con l'AI, testi legali e di checkout. Reperti per gravità, testo corretto e approvazione documentata.",
          detail: {
            idealFor: [
              "Localization o content manager che hanno ricevuto una consegna in italiano e vogliono una revisione indipendente con evidenze, non solo un «sembra a posto»",
              "Brand che producono contenuti italiani con traduzione automatica o AI e vogliono sapere se reggono",
              "Team legali e compliance in e-commerce, fintech o assicurazioni che devono documentare la revisione dei testi italiani",
            ],
            what: [
              "Report QA con reperti per fascia e gravità",
              "Testo corretto in Excel: originale, problema, correzione, motivazione",
              "Nota di compliance per testi legali e normativi",
              "Documento di approvazione formale",
            ],
            steps: [
              { h: "Triage e deduplicazione", p: "Normalizzo e stratifico il file e raggruppo le stringhe identiche o quasi: un batch tipico di 650 stringhe diventa circa 480 voci uniche da revisionare." },
              { h: "Revisione per fascia", p: "Reviso per primi e integralmente i contenuti critici (pagamento, testi legali, checkout). Seguono account, onboarding e schede prodotto. I contenuti a basso rischio li analizzo per pattern sistematici." },
              { h: "Reperti e correzioni", p: "Documento ogni problema con gravità, correzione concreta e una motivazione che il tuo team può riutilizzare." },
              { h: "Approvazione", p: "Un documento formale registra cosa ho revisionato e cosa ho trovato, e conferma che il testo italiano è pronto per il rilascio." },
            ],
            timeline: "Indicativamente 15 giorni lavorativi dalla consegna dell'input.",
          },
        },
      ],
      retainer: {
        label: "Modalità di collaborazione",
        h: "White-label per agenzie",
        p: "Le agenzie di traduzione, SEO e marketing possono offrire l'italiano con il proprio nome. Lavoro dentro i tuoi processi e i tuoi strumenti, consegno ai tuoi project manager e non contatto i tuoi clienti se non me lo chiedi tu. Vale per tutti e tre i servizi qui sopra.",
        detail: {
          idealFor: [
            "Agenzie in Austria, Germania e Svizzera con clienti che vendono in Italia ma senza uno specialista italiano interno",
            "Agenzie SEO e GEO che vogliono coprire l'italiano senza assumere",
          ],
          what: [
            "Consegne con il tuo marchio, nei tuoi template",
            "NDA come standard",
            "Un unico referente per l'italiano su tutti i tuoi progetti",
          ],
          steps: [
            { h: "Call introduttiva", p: "I tuoi clienti, i tuoi strumenti, i tuoi requisiti di qualità e il modo in cui fai il briefing ai freelance." },
            { h: "Progetto di prova", p: "Un piccolo lavoro su contenuti reali, così valuti la qualità prima di impegnarti." },
            { h: "Collaborazione continuativa", p: "Progetti man mano che arrivano, oppure una capacità mensile riservata se il tuo volume in italiano è regolare." },
          ],
          note: "Tariffe per agenzie su richiesta.",
        },
      },
      form: {
        nameLabel: "Nome",
        emailLabel: "Email",
        messageLabel: "Altro",
        messagePlaceholder: "Facoltativo: scadenza, contesto, un link alle pagine o una domanda specifica",
        submit: "Invia richiesta",
        submitting: "Invio in corso…",
        success: "Ricevuto. Ti rispondo entro un giorno lavorativo.",
        error: "Qualcosa è andato storto. Scrivimi direttamente:",
        ctaAsync: ["Richiedi la localizzazione", "Richiedi il lavoro SEO/GEO", "Richiedi una revisione QA", "Parliamo di white-label"],
        ctaCalendly: "Preferisci una call?",
        s01: [
          { name: "content-type", label: "Tipo di contenuto", options: ["Negozio e schede prodotto", "Sito web", "Campagne e newsletter", "Interfaccia / app", "Altro"] },
          { name: "source-language", label: "Lingua di partenza", options: ["Tedesco", "Inglese", "Entrambe"] },
          { name: "volume", label: "Volume stimato", options: ["Meno di 5.000 parole", "5.000–20.000 parole", "Oltre 20.000 parole", "Non lo so"] },
        ],
        s02: [
          { name: "italian-site", label: "Sito italiano", options: ["Già online", "In preparazione", "Non ancora"] },
          { name: "focus", label: "Interesse principale", options: ["Ricerca keyword", "Ottimizzazione on-page", "Verifica risposte AI", "Non lo so ancora"] },
          { name: "pages", label: "Numero di pagine", options: ["Meno di 20", "20–100", "Oltre 100"] },
        ],
        s03: [
          { name: "content-type", label: "Cosa va revisionato", options: ["Traduzione di agenzia", "Traduzione automatica o testo AI", "Testi legali e checkout", "Mix"] },
          { name: "volume", label: "Volume stimato", options: ["Meno di 3.000 parole", "3.000–10.000 parole", "Oltre 10.000 parole"] },
          { name: "go-live", label: "Scadenza go-live", options: ["Meno di 2 settimane", "2–4 settimane", "Oltre 4 settimane", "Già online"] },
          { name: "compliance", label: "Serve un'approvazione formale?", options: ["Sì", "No", "Non lo so"] },
        ],
        retainer: [
          { name: "agency-type", label: "Tipo di agenzia", options: ["Traduzione / localizzazione", "SEO / GEO", "Marketing / contenuti", "Altro"] },
          { name: "need", label: "Cosa ti serve in italiano", options: ["Localizzazione", "SEO/GEO", "QA", "Più di uno"] },
          { name: "frequency", label: "Con che frequenza", options: ["Un progetto", "Occasionalmente", "Regolarmente"] },
        ],
      },
    },
    about: {
      title: "Con chi lavori",
      p1: "Alessio Di Rubbo. Madrelingua italiano, MA in Applied Linguistics all'Università di Vienna, lavoro da Vienna in tedesco e inglese.",
      p2: "Dal 2015 localizzo in italiano contenuti di marketing, e-commerce e tecnici dal tedesco e dall'inglese, per clienti diretti e tramite agenzie come Translated e Tolq. Ho seguito end-to-end il lancio italiano del marketplace online di Kaufland, guida di stile e glossario italiani compresi. Quasi tutto l'italiano che non funziona non è sbagliato: semplicemente nessuno l'ha scritto per un lettore italiano. Il mio lavoro parte da lì.",
      clients: "Brand per cui ho lavorato, direttamente o tramite agenzie: Amazon, NVIDIA, Kaufland, Stellantis, Swarovski, Sixt.",
      photoAlt: "Alessio Di Rubbo",
    },
    cta: { title: "Mandami una pagina in italiano. Ti dico cosa nota un lettore madrelingua.", button: "Prenota una revisione gratuita", or: "oppure scrivi a" },
    footer: { rights: "Alessio Di Rubbo · Vienna, Austria", lang: "Lingua" },
  },

  de: {
    htmlLang: "de",
    metaTitle: "Alessio Di Rubbo | Italienische Lokalisierung, SEO und GEO für DACH-Marken",
    metaDesc: "Lokalisierung ins Italienische, italienisches SEO und GEO sowie Linguistic QA für Marken und Agenturen in Österreich, Deutschland und der Schweiz, die nach Italien verkaufen. Italienischer Muttersprachler mit Sitz in Wien.",
    nav: { audit: "Beispiel-Review", findings: "Befunde", notes: "Notizen", services: "Leistungen", resources: "Ressourcen", about: "Über mich", cta: "Kostenlose Prüfung buchen", menu: "Menü" },
    eyebrow: { audit: "review", findings: "befunde", notes: "notizen", process: "ablauf", services: "leistungen", about: "über mich" },
    hero: {
      h1a: "Ihre Marke spricht schon Italienisch.",
      h1b: "Ich finde, wo sie ",
      h1mark: "übersetzt",
      h1c: " klingt.",
      sub: "Lokalisierung ins Italienische und italienisches SEO/GEO für Marken und Agenturen aus dem DACH-Raum, die in Italien verkaufen. Texte, die Ihre italienischen Kundinnen und Kunden als original italienisch lesen und die bei Google ebenso bestehen wie in den Antworten von ChatGPT oder Gemini.",
      cta: "Kostenlose Prüfung buchen",
      secondary: "Beispiel-Review ansehen",
      note: "Wien. Remote, für Marken und Agenturen im DACH-Raum und in Italien.",
      creds: ["MA Angewandte Linguistik, Universität Wien", "Über 10 Jahre Lokalisierung EN/DE→IT für E-Commerce und Marketing", "Italienischer Launch des Kaufland-Onlinemarktplatzes, end-to-end", "Wien · remote · EN, DE, IT"],
    },
    demo: {
      title: "Ein Produkttext. Drei Probleme, die keine Rechtschreibprüfung findet.",
      source: "Quelle · DE",
      output: "Italienische Fassung · IT",
      src: "Unsere Wanderschuhe sind wasserdicht und bieten auch auf langen Touren optimalen Halt. Jetzt bestellen und kostenlos zurücksenden.",
      out: ["Le nostre scarpe da escursionismo", " sono impermeabili e offrono anche nei tour lunghi ", "un appoggio ottimale", ". ", "Ordina ora e rispedisci gratuitamente", "."],
      notes: [
        { tag: "Suchbegriff", text: "In Italien sucht man nach „scarpe da trekking“. „Scarpe da escursionismo“ ist korrektes Italienisch, wird aber kaum eingegeben: Die Seite verfehlt den Begriff, der Traffic bringt." },
        { tag: "Lehnübersetzung", text: "„Optimaler Halt“ Wort für Wort übertragen. Nativer italienischer Produkttext sagt, dass der Schuh „resta stabile“." },
        { tag: "Konvention", text: "Italienische Shops schreiben „Reso gratuito“. „Rispedisci gratuitamente“ ist verständlich, klingt aber ausgerechnet in der Zeile übersetzt, die Vertrauen schaffen soll." },
      ],
      footer: "Eine Rechtschreibprüfung findet hier nichts. Ihre italienischen Kundinnen und Kunden bemerken alle drei Probleme, Google zumindest das erste.",
    },
    audit: {
      title: "So sieht ein Review aus",
      lead: "Sechs typische Probleme, rekonstruiert, um die Form eines Reports zu zeigen. Jede Zeile ist ein Textelement: was die italienische Fassung sagt, warum sie nicht funktioniert, wie schwer das wiegt und was stattdessen dort stehen sollte. Ein echter Report ordnet die Probleme nach Häufigkeit und Wirkung, damit Sie wissen, wo Sie anfangen. Weiter unten: drei Befunde aus echter Arbeit.",
      cols: ["Quelle", "Italienische Fassung", "Problem", "Schweregrad", "Korrektur"],
      rows: [
        ["Widerrufsrecht", "Diritto di revoca", "Rechtsterminologie: Das italienische Verbraucherrecht spricht von „diritto di recesso“. Der falsche Begriff in den AGB ist ein Haftungsrisiko.", "Kritisch", "Diritto di recesso"],
        ["Sale", "Sale", "Englisches Lehnwort stehen gelassen. Auf Italienisch heißt „sale“ Salz, und gesucht wird nach „saldi“.", "Schwer", "Saldi"],
        ["Damen-Laufschuhe Bestseller", "Bestseller scarpe da corsa per signore", "Register und Suchbegriff: „signore“ klingt altmodisch und wird nicht gesucht. Der Zielbegriff lautet „scarpe running donna“.", "Schwer", "Scarpe running donna più vendute"],
        ["FAQ: Is the jacket waterproof?", "La giacca è waterproof?", "Anglizismus in einer FAQ. KI-Assistenten zitieren FAQs oft fast wörtlich, und der Anglizismus landet in der Antwort, die Ihre Kundinnen und Kunden lesen.", "Schwer", "La giacca è impermeabile?"],
        ["Versandkostenfrei ab 50 €", "Spedizione senza costi da 50 €", "Lehnübersetzung. Italienische Shops verwenden dafür eine feste Formel.", "Leicht", "Spedizione gratuita sopra i 50 €"],
        ["Hi Anna, your order is on its way!", "Ciao Anna, il tuo ordine è sulla sua strada!", "Wörtliche Lehnübersetzung, auf Italienisch fast sinnlos.", "Schwer", "Ciao Anna, il tuo ordine è in arrivo!"],
      ],
      after: "Muster in der Stichprobe: Keines der sechs Probleme ist ein Rechtschreib- oder Grammatikfehler. Zwei kosten Suchtraffic, eines ist ein rechtliches Risiko, drei lassen den Shop übersetzt wirken.",
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
      title: "Notizen zum Italienischen für DACH-Marken",
      items: [
        { h: "Übersetzte Keywords sind keine Keywords", p: "Eine aus dem Deutschen übersetzte Keyword-Liste liefert Begriffe, die korrekt sind und kaum gesucht werden. Die italienische Suche hat eigene Gewohnheiten: mal Englisch, wo das Deutsche Deutsch verwendet („scarpe running“ für „Laufschuhe“), mal umgekehrt. Die Keyword-Recherche muss auf Italienisch neu beginnen, bei dem, was Menschen tatsächlich eintippen." },
        { h: "Du, Sie, tu, Lei", p: "Viele deutsche Marken wechseln bewusst vom „Sie“ zum „du“. Im Italienischen ist „tu“ für Consumer-Marken die Norm, doch ein Shop mit „tu“ auf den Produktseiten und „Lei“ in den AGB wirkt wie zwei verschiedene Unternehmen. Das Register wird einmal entschieden, schriftlich festgehalten und eingehalten." },
        { h: "KI-Assistenten zitieren, was Sie geschrieben haben", p: "Wenn ChatGPT, Gemini oder Perplexity eine italienische Frage zu Ihrem Produkt beantworten, bauen sie die Antwort aus Texten, die sie finden, oft aus Ihren eigenen Seiten. Eine Lehnübersetzung auf Ihrer Website wird zur Lehnübersetzung in der Antwort, nun als neutraler Rat präsentiert. GEO auf Italienisch beginnt mit einem Italienisch, das es wert ist, zitiert zu werden." },
      ],
    },
    method: {
      title: "So läuft es ab",
      steps: [
        { h: "Kostenlose Prüfung", p: "Sie buchen ein 30-minütiges Gespräch und schicken mir mindestens drei Arbeitstage vorher eine italienische Seite (Produktseite, Landingpage, Kategorietext). Ich prüfe sie vorab, und im Gespräch zeige ich Ihnen, was muttersprachliche Leserinnen und Leser bemerken und ob die Probleme systematisch wirken." },
        { h: "Angebot", p: "Wenn sich die Arbeit lohnt, erhalten Sie ein schriftliches Angebot mit Umfang, Ergebnissen, Zeitplan und Preis." },
        { h: "Projekt oder laufend", p: "Ein einzelnes Projekt oder ein monatliches Kontingent für Marken, die regelmäßig italienische Inhalte veröffentlichen." },
      ],
    },
    services: {
      title: "Leistungen",
      lead: "Ich arbeite ausschließlich ins Italienische. Jeder Auftrag endet mit einem Ergebnis, mit dem Ihr Team sofort arbeiten kann, von veröffentlichungsfertigen italienischen Seiten bis zum QA-Report mit Freigabe.",
      more: "Ablauf und Ergebnis",
      close: "Schließen",
      headIdealFor: "Geeignet für",
      headDeliverables: "Was Sie erhalten",
      headProcess: "Wie ein typischer Auftrag abläuft",
      headTimeline: "Richtzeitraum",
      items: [
        {
          n: "01",
          h: "Italienische Lokalisierung",
          p: "Lokalisierung DE/EN→IT von Shop- und Produktseiten, Websites, Kampagnen, Newslettern und Benutzeroberflächen. Geschrieben für ein italienisches Publikum, mit Glossar und Styleguide, damit Ihre Markenstimme über Seiten und Releases hinweg einheitlich bleibt.",
          detail: {
            idealFor: [
              "Marketing- und E-Commerce-Verantwortliche von DACH-Marken, die in Italien starten oder wachsen und ein Italienisch brauchen, das verkauft, nicht bloß eines, das korrekt ist",
              "Marken mit einer italienischen Website, die einmal übersetzt und danach nie wieder angesehen wurde",
              "Agenturen, die für Kundenprojekte eine verlässliche italienische Fachkraft brauchen (auch als White-Label)",
            ],
            what: [
              "Lokalisierte italienische Inhalte, veröffentlichungsfertig oder geliefert in Ihrem CAT-Tool bzw. TMS",
              "Italienisches Glossar und Styleguide: Register, Schlüsselbegriffe, Markenstimme",
              "Hinweise zu kulturellen oder rechtlichen Punkten, die eine Entscheidung Ihrerseits brauchen",
            ],
            steps: [
              { h: "Briefing", p: "Zielgruppe, Tonalität, vorhandenes Material und Keyword-Prioritäten. Wenn Sie bereits einen deutschen oder englischen Styleguide haben, passe ich ihn an, statt bei null anzufangen." },
              { h: "Glossar und Register", p: "Schlüsselbegriffe und die Wahl zwischen tu und Lei werden vor der ersten Seite festgelegt, damit sie zwischen Seiten und Releases nicht abweichen." },
              { h: "Lokalisierung", p: "Die Texte entstehen für italienische Leserinnen und Leser, nicht Satz für Satz entlang der Quelle. Wo ein Claim, eine Maßeinheit oder eine Konvention nicht übertragbar ist, weise ich darauf hin." },
              { h: "Prüfung und Übergabe", p: "Ein zweiter Durchgang gegen Quelle und Glossar, danach die Lieferung im Format, mit dem Ihr Team arbeitet." },
            ],
            timeline: "Wird je Projekt nach Umfang und Termin vereinbart.",
          },
        },
        {
          n: "02",
          h: "Italienisches SEO & GEO",
          p: "Keyword-Recherche auf Italienisch und On-Page-Arbeit für Ihre lokalisierten Seiten, dazu eine Prüfung, wie ChatGPT, Gemini und Perplexity Ihre Marke auf Italienisch beschreiben. Zitiert zu werden ist ein technisches Problem. In gutem Italienisch zitiert zu werden ist ein sprachliches, und um diesen Teil kümmere ich mich.",
          detail: {
            idealFor: [
              "DACH-Marken, deren italienische Seiten online sind, aber wenig organischen Traffic aus Italien bringen",
              "SEO- und GEO-Agenturen, die die technische Seite abdecken und für Keywords, Inhalte und KI-Antworten eine italienische Fachkraft brauchen",
              "Marketingteams, die wissen wollen, was KI-Assistenten italienischen Kundinnen und Kunden über ihre Produkte erzählen",
            ],
            what: [
              "Italienische Keyword-Map: Suchbegriffe pro Seite, mit Suchintention und Priorität",
              "Überarbeitete Title, Meta-Descriptions, Überschriften und FAQs oder Empfehlungen für Ihr Team",
              "Prüfung der KI-Antworten: italienische Fragen an die wichtigsten Assistenten, jede Antwort bewertet nach Richtigkeit, Sprache und Markenstimme",
            ],
            steps: [
              { h: "Umfang", p: "Welche Seiten und Produkte zählen, mit wem Sie in Italien konkurrieren und welche Fragen italienische Kundinnen und Kunden tatsächlich stellen." },
              { h: "Italienische Keyword-Recherche", p: "Ausgangspunkt ist das italienische Suchverhalten, nicht übersetzte deutsche Keywords." },
              { h: "On-Page-Arbeit", p: "Title, Descriptions, Überschriften, FAQs und Fließtext werden an die Keyword-Map angepasst, ohne die Markenstimme zu verlieren." },
              { h: "Prüfung der KI-Antworten", p: "Ich stelle den wichtigsten KI-Assistenten die Fragen Ihrer Kundinnen und Kunden auf Italienisch und halte fest, was sie über Sie sagen: falsche oder veraltete Angaben, Lehnübersetzungen, Tonalität. Jedes Problem wird der Seite zugeordnet, aus der es vermutlich stammt." },
            ],
            timeline: "Wird je Projekt nach Anzahl der Seiten und Märkte vereinbart.",
            note: "Inklusive der sprachbezogenen technischen Prüfungen (hreflang, italienische URLs und Slugs, italienische Metadaten und Texte in strukturierten Daten). Technisches SEO der gesamten Website (Indexierung, Ladezeit, Serverkonfiguration) bleibt bei Ihrem Entwicklungsteam oder Ihrer Agentur.",
          },
        },
        {
          n: "03",
          h: "Italienische Linguistic QA",
          p: "Unabhängige Prüfung italienischer Inhalte vor oder nach dem Release: Agenturübersetzungen, maschinell übersetzte oder KI-generierte Texte, Rechts- und Checkout-Texte. Befunde nach Schweregrad, korrigierter Text und dokumentierte Freigabe.",
          detail: {
            idealFor: [
              "Verantwortliche für Lokalisierung oder Content, die eine italienische Lieferung erhalten haben und eine unabhängige Prüfung mit Belegen wollen, nicht nur ein „sieht gut aus“",
              "Marken, die italienische Inhalte mit maschineller Übersetzung oder KI erstellen und wissen wollen, ob sie bestehen",
              "Rechts- und Compliance-Teams in E-Commerce, Fintech oder Versicherung, die die Prüfung italienischer Texte dokumentieren müssen",
            ],
            what: [
              "QA-Report mit Befunden nach Stufe und Schweregrad",
              "Korrigierter Text in Excel: Original, Problem, Korrektur, Begründung",
              "Compliance-Notiz für rechtliche und regulatorische Texte",
              "Formales Freigabedokument",
            ],
            steps: [
              { h: "Triage und Deduplizierung", p: "Ihre Datei wird bereinigt und stratifiziert, identische oder nahezu identische Strings werden gebündelt: Ein typisches Batch von 650 Strings ergibt rund 480 eindeutige Prüfeinheiten." },
              { h: "Stufenweise Prüfung", p: "Kritische Inhalte (Zahlung, Rechtstexte, Checkout) werden zuerst und vollständig geprüft. Konto, Onboarding und Produktinhalte folgen. Inhalte mit geringem Risiko werden auf systematische Muster gescannt." },
              { h: "Befunde und Korrekturen", p: "Jedes Problem wird mit Schweregrad, konkreter Korrektur und einer Begründung dokumentiert, die Ihr Team wiederverwenden kann." },
              { h: "Freigabe", p: "Ein formales Dokument hält fest, was geprüft und was gefunden wurde, und bestätigt, dass der italienische Text freigegeben ist." },
            ],
            timeline: "In der Regel 15 Arbeitstage ab Eingang des Inputs.",
          },
        },
      ],
      retainer: {
        label: "Kooperationsmodell",
        h: "White-Label für Agenturen",
        p: "Übersetzungs-, SEO- und Marketingagenturen können Italienisch unter eigenem Namen anbieten. Ich arbeite in Ihren Prozessen und Tools, liefere an Ihr Projektmanagement und kontaktiere Ihre Kundinnen und Kunden nur, wenn Sie das wünschen. Gilt für alle drei Leistungen oben.",
        detail: {
          idealFor: [
            "Agenturen in Österreich, Deutschland und der Schweiz mit Kundinnen und Kunden, die nach Italien verkaufen, aber ohne interne italienische Fachkraft",
            "SEO- und GEO-Agenturen, die Italienisch abdecken wollen, ohne dafür einzustellen",
          ],
          what: [
            "Lieferungen unter Ihrer Marke, in Ihren Vorlagen",
            "NDA als Standard",
            "Eine feste Ansprechperson für Italienisch über alle Ihre Projekte",
          ],
          steps: [
            { h: "Kennenlerngespräch", p: "Ihre Kundinnen und Kunden, Ihre Tools, Ihre Qualitätsanforderungen und wie Sie externe Fachleute briefen." },
            { h: "Testprojekt", p: "Ein kleiner Auftrag mit echten Inhalten, damit Sie die Qualität beurteilen können, bevor Sie sich festlegen." },
            { h: "Laufende Zusammenarbeit", p: "Projekte nach Bedarf oder eine reservierte Monatskapazität, wenn Ihr italienisches Volumen regelmäßig ist." },
          ],
          note: "Agenturkonditionen auf Anfrage.",
        },
      },
      form: {
        nameLabel: "Name",
        emailLabel: "E-Mail",
        messageLabel: "Sonstiges",
        messagePlaceholder: "Optional: Deadline, Kontext, ein Link zu den Seiten oder eine konkrete Frage",
        submit: "Anfrage senden",
        submitting: "Wird gesendet…",
        success: "Erhalten. Ich melde mich innerhalb eines Arbeitstages.",
        error: "Etwas ist schiefgelaufen. Schreiben Sie mir direkt:",
        ctaAsync: ["Lokalisierung anfragen", "SEO/GEO anfragen", "QA-Prüfung anfragen", "Über White-Label sprechen"],
        ctaCalendly: "Lieber ein Gespräch?",
        s01: [
          { name: "content-type", label: "Inhaltstyp", options: ["Shop- und Produktseiten", "Website", "Kampagnen und Newsletter", "UI / App", "Anderes"] },
          { name: "source-language", label: "Ausgangssprache", options: ["Deutsch", "Englisch", "Beides"] },
          { name: "volume", label: "Geschätzter Umfang", options: ["Unter 5.000 Wörter", "5.000–20.000 Wörter", "Über 20.000 Wörter", "Nicht sicher"] },
        ],
        s02: [
          { name: "italian-site", label: "Italienische Website", options: ["Bereits online", "In Vorbereitung", "Noch nicht"] },
          { name: "focus", label: "Hauptinteresse", options: ["Keyword-Recherche", "On-Page-Optimierung", "Prüfung der KI-Antworten", "Noch unklar"] },
          { name: "pages", label: "Anzahl der Seiten", options: ["Unter 20", "20–100", "Über 100"] },
        ],
        s03: [
          { name: "content-type", label: "Was geprüft werden soll", options: ["Agenturübersetzung", "Maschinell übersetzt oder KI-generiert", "Rechts- und Checkout-Texte", "Mix"] },
          { name: "volume", label: "Geschätzter Umfang", options: ["Unter 3.000 Wörter", "3.000–10.000 Wörter", "Über 10.000 Wörter"] },
          { name: "go-live", label: "Go-live-Zeitplan", options: ["Unter 2 Wochen", "2–4 Wochen", "Über 4 Wochen", "Bereits online"] },
          { name: "compliance", label: "Formale Freigabe nötig?", options: ["Ja", "Nein", "Nicht sicher"] },
        ],
        retainer: [
          { name: "agency-type", label: "Art der Agentur", options: ["Übersetzung / Lokalisierung", "SEO / GEO", "Marketing / Content", "Andere"] },
          { name: "need", label: "Was Sie auf Italienisch brauchen", options: ["Lokalisierung", "SEO/GEO", "QA", "Mehreres"] },
          { name: "frequency", label: "Wie oft", options: ["Ein Projekt", "Gelegentlich", "Regelmäßig"] },
        ],
      },
    },
    about: {
      title: "Mit wem Sie arbeiten",
      p1: "Alessio Di Rubbo. Italienischer Muttersprachler, MA in Angewandter Linguistik an der Universität Wien, arbeite von Wien aus auf Deutsch und Englisch.",
      p2: "Seit 2015 lokalisiere ich Marketing-, E-Commerce- und technische Inhalte aus dem Deutschen und Englischen ins Italienische, direkt und über Agenturen wie Translated und Tolq. Den italienischen Launch des Kaufland-Onlinemarktplatzes habe ich end-to-end betreut, inklusive italienischem Styleguide und Glossar. Das meiste Italienisch, das nicht funktioniert, ist nicht falsch. Es wurde nur nie für ein italienisches Publikum geschrieben, und genau da setze ich an.",
      clients: "Marken, für die ich gearbeitet habe, direkt oder über Agenturen: Amazon, NVIDIA, Kaufland, Stellantis, Swarovski, Sixt.",
      photoAlt: "Alessio Di Rubbo",
    },
    cta: { title: "Schicken Sie mir eine italienische Seite. Ich sage Ihnen, was muttersprachliche Leserinnen und Leser bemerken.", button: "Kostenlose Prüfung buchen", or: "oder schreiben Sie an" },
    footer: { rights: "Alessio Di Rubbo · Wien, Österreich", lang: "Sprache" },
  },
};

/* ---------- helpers -------------------------------------------------------- */
function detectLang() {
  const seg = window.location.pathname.split("/")[1];
  if (seg === "it") return "it";
  if (seg === "de") return "de";
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
    setMeta("og:url", SITE_URL + (lang === "en" ? "/" : "/" + lang + "/"), "property");
    setMeta("og:locale", lang === "it" ? "it_IT" : lang === "de" ? "de_DE" : "en_US", "property");
    setMeta("og:image", `${SITE_URL}/og.jpg`, "property");
    setMeta("twitter:card", "summary_large_image");
    const ld = {
      "@context": "https://schema.org", "@type": "ProfessionalService",
      name: "Alessio Di Rubbo | Italian localization, SEO and GEO", url: SITE_URL, email: EMAIL,
      areaServed: ["AT", "DE", "CH", "IT"],
      address: { "@type": "PostalAddress", addressLocality: "Vienna", addressCountry: "AT" },
      founder: { "@type": "Person", name: "Alessio Di Rubbo", jobTitle: "Italian Localization, SEO/GEO and Linguistic QA Specialist", sameAs: [LINKEDIN], alumniOf: "University of Vienna", knowsLanguage: ["it", "de", "en"] },
      serviceType: ["Italian localization", "Italian SEO", "Generative Engine Optimization (Italian)", "Italian linguistic QA"],
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
  .svc-card{border:1px solid var(--mark);transition:box-shadow .15s}
  .svc-card:hover{box-shadow:0 4px 18px rgba(14,21,18,.09)}
  article.svc-open{border-color:var(--pen)}
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
  const href = CALENDLY_URL || `mailto:${EMAIL}?subject=Free%20Italian%20review`;
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
            <span className="tag">{i + 1} · {n.tag}</span><span className="ink2">: {n.text}</span>
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
      <div className="svc-form-cta">
        <button type="button" className="btn" style={{ padding: ".65rem 1.2rem", fontSize: ".95rem" }}
                onClick={() => setOpen(true)}>
          {ctaLabel}
        </button>
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
              <option value="" disabled>…</option>
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
  const setLang = (l) => {
    setLangState(l);
    persistLang(l);
    window.history.pushState({}, "", l === "en" ? "/" : "/" + l + "/");
  };
  useEffect(() => {
    const onPop = () => setLangState(detectLang());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
            <a href="/risorse/" hrefLang="it" className="nav">{t.nav.resources}</a>
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
              <a href="/risorse/" hrefLang="it">{t.nav.resources}</a>
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
              <div className="grid md:grid-cols-3 items-start gap-6">
                {t.services.items.map((s, i) => (
                  <article key={i} className={`svc-card p-6 md:p-8 ${selectedSvc === i ? "svc-open" : ""}`}>
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
                    formName={["localization-brief","seo-geo-brief","linguistic-qa-brief"][selectedSvc]}
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
                        formName="agency-brief"
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
