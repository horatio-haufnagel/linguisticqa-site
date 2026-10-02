---
title: Do AI systems cite different sources in Italian and German? What the research shows and what it means for your website
description: ChatGPT switches almost all its sources when the query language changes, Claude barely does. What the Toronto study shows and why Italian remains a blind spot.
type: dati
published: 2026-10-02
version: 1.0
lang: en
translation: fonti-ai-italiano-tedesco
---

It depends on the system. According to a 2025 study from the University of Toronto, ChatGPT replaces almost all of the sources it cites when the language of the question changes, while Claude tends to cite the same websites, often in English. The study tested German but not Italian. If you sell in Italy, it gives you no data on how AI systems treat your Italian pages, so you have to check it yourself.

## What the Toronto study measured

The researchers translated 100 base queries into five languages (Chinese, Japanese, German, French and Spanish) and compared the cited sources with those returned in English. The queries cover ten consumer product categories, from smartphones to electric vehicles, with ten queries per category.

They tested ChatGPT, Claude, Gemini and Perplexity, with Google as the baseline. For each answer they collected the cited links, mapped them to their domains and measured how much the sources overlap from one language to another.

The paper is by Mahe Chen, Xiaoxuan Wang, Kaiwen Chen and Nick Koudas and appeared as an arXiv preprint in September 2025. The German-language handbook *Generative Engine Optimization* by Alpar et al. (Rheinwerk, 2026) summarizes its findings in chapter 10.

## How sources change with the language

Each system reacts differently to a change of language. The table summarizes the two main findings: how far the sources stay the same compared with English, and which language the cited websites are in.

| System | Same sources across languages | Language of cited websites |
| --- | --- | --- |
| ChatGPT | Almost none: switches to a different set of sources with each language | More sites in the query language than Google |
| Claude | Many: reuses the same established domains | Far more English than Google |
| Gemini | Slightly above Google in some languages, still few | Varies with the query language |
| Perplexity | Similar to Google, still few | More sites in the query language than Google |

With non-English queries, citations shift toward the language of the query, but not to the same degree for every system. “Being cited by AI” is therefore not a single outcome: it depends on which system your customers use and which language they write in.

## The blind spot: Italian was not tested

Italian is not among the study’s languages. German is, so a German website has at least a first reference point, while an Italian one has none.

There is a second limitation. The queries are about consumer products, not B2B services or tourism. If you sell a service in Italy, you cannot apply the results to your case without checking them first.

The Alpar handbook is cautious too. Its section heading says the search language “seems” to matter depending on the system (p. 288), and its only practical advice is to localize content where systems prefer local sources (p. 289). The book does not explain how to do this and does not cover the Italian market.

Missing data on Italian does not mean AI systems behave as they do in German. It means this study did not measure it.

## What it means if you sell in Italy

There is no single rule for the Italian version of your website. The right choice depends on four factors.

**Which systems your customers use.** According to the study, ChatGPT and Perplexity cite more sites in the query language. If your Italian customers mainly use these two, Italian-language sources carry more weight. Claude, by contrast, cites many English sources even when the question is in another language. This suggests that an English page about your company may be the one Claude picks up, although the study did not test this directly.

**How many Italian sources mention you.** AI systems often cite independent sources. In the US data reported in the handbook, AI search cited third-party sources (earned media) in 81.9% of cases in the automotive category, against 45.1% for Google (p. 287). If no Italian publication or industry portal mentions your company, your own website remains the only Italian source about you.

**How the Italian version is produced.** A page translated from German answers the questions German customers ask. If Italian customers phrase the question differently, the answer they are looking for may not be there. This is a working hypothesis, not a result of the study, and the first thing to check.

**How consistent your terms are across languages.** The handbook lists consistent terminology among the factors that make a text worth citing (p. 138) and recommends using the same terms across all channels (p. 322). With two languages, that adds a decision: fix the Italian rendering of product names and key concepts in advance and use it everywhere.

## How to check it yourself in under an hour

A manual test does not replace a study, but it tells you whether the issue affects your company. AI answers change from one request to the next, so repeat each question. In his O’Reilly book on measuring GEO, Andreas Voniatis asks each question 10 times per platform. For a first check, two repetitions are enough.

1. Pick 3 questions your customers would actually ask, for example “Which [service] provider would you recommend for a company in Italy?”
2. Write them in German and in Italian the way a native speaker would, not as word-for-word translations. If nobody on your team is a native Italian speaker, have one write the Italian questions.
3. Ask ChatGPT, Perplexity and Gemini twice each, opening a new conversation every time. Add Claude if your customers use it.
4. For each answer, note whether your company appears and which domains are cited.
5. Compare the two languages: do the sources match? Does your company appear in only one language?

That gives you 36 answers (3 questions × 2 languages × 3 systems × 2 repetitions). The result is indicative, not statistical, but it shows whether the Italian version of your website gets cited or stays invisible.

## Checklist for the Italian version of your website

- You know which AI systems your customers in Italy use.
- Your Italian pages answer questions the way Italian customers ask them, not only as translations of the German pages.
- Each section gives the answer in its first sentence.
- Product names and key concepts have one Italian rendering, used across the whole site.
- Independent Italian sources, such as publications or industry portals, mention your company.
- Every page shows the date of its last update.
- You have run the manual test in German and Italian and kept the results to compare over time.

## Frequently asked questions

### Is translating the German website into Italian enough to get cited by AI systems in Italy?

There is no data to confirm it. The Toronto study did not test Italian. A translation is the starting point, but you need to check whether it answers the questions Italian customers ask.

### Which AI systems cite more sources in the query language?

According to the study, ChatGPT and Perplexity, both more than Google. Claude cites English sources more often.

### Do the findings for German apply to Italian?

That has not been shown. German is among the study’s languages, Italian is not, and all queries were about consumer products.

### How often should I repeat the manual test?

AI answers change as models are updated. I recommend repeating it every three months with the same questions, so the results stay comparable.

## Sources

- Chen, M., Wang, X., Chen, K., Koudas, N. (2025). [Generative Engine Optimization: How to Dominate AI Search](https://arxiv.org/abs/2509.08919). arXiv preprint 2509.08919, section 4.2.3.
- Alpar, A., Mues, M., Michalik, M., Grahl, M., Schneider, F. (2026). *Generative Engine Optimization. Inhalte optimieren für ChatGPT & Co.* Rheinwerk Computing. ISBN 9783367114269.
- Voniatis, A. (2026). *Generative Engine Optimization with Python*. O’Reilly Media, Early Release, chapter 6.
