"""
mechanical_checks.py

Controlli deterministici (ortografici e tipografici) sul testo italiano.
Basato su it-orthography-reference.md nella stessa cartella framework.
Chiamato da evaluate.py prima della chiamata API, non iniettato nel prompt.

Ogni funzione ritorna una lista di dict:
    {"severity": "error" | "review", "rule": str, "message": str}
"""

from __future__ import annotations

import re
from pathlib import Path


def _check_straight_quotes(text: str) -> list[dict]:
    findings = []
    if '"' in text:
        findings.append({
            "severity": "error",
            "rule": "virgolette_dritte",
            "message": 'Virgolette dritte (") trovate: usare le virgolette alte curve (“”).',
        })
    # straight apostrophe between word chars (genuine apostrophe, not a quote at word boundary)
    if re.search(r"\w'\w", text):
        findings.append({
            "severity": "error",
            "rule": "apostrofo_dritto",
            "message": "Apostrofo dritto (') trovato: usare l’apostrofo curvo (’).",
        })
    return findings


def _check_currency_spacing(text: str) -> list[dict]:
    if re.search(r'\d€', text):
        return [{
            "severity": "error",
            "rule": "valuta_spazio",
            "message": "Simbolo € attaccato al numero senza spazio (es. '10€'). Forma corretta: '10 €'.",
        }]
    return []


def _check_percent_spacing(text: str) -> list[dict]:
    # "10 %" → errore; "10%" → corretto
    if re.search(r'\d\s+%', text):
        return [{
            "severity": "error",
            "rule": "percentuale_spazio",
            "message": "Spazio tra numero e simbolo % (es. '10 %'). Forma corretta: '10%' (senza spazio).",
        }]
    return []


_UNCONTRACTED = [
    (r'\ba il\b', 'al'),
    (r'\ba lo\b', 'allo'),
    (r'\ba la\b', 'alla'),
    (r'\ba i\b', 'ai'),
    (r'\ba gli\b', 'agli'),
    (r'\ba le\b', 'alle'),
    (r'\bda il\b', 'dal'),
    (r'\bda lo\b', 'dallo'),
    (r'\bda la\b', 'dalla'),
    (r'\bda i\b', 'dai'),
    (r'\bda gli\b', 'dagli'),
    (r'\bda le\b', 'dalle'),
    (r'\bdi il\b', 'del'),
    (r'\bdi lo\b', 'dello'),
    (r'\bdi la\b', 'della'),
    (r'\bdi i\b', 'dei'),
    (r'\bdi gli\b', 'degli'),
    (r'\bdi le\b', 'delle'),
    (r'\bin il\b', 'nel'),
    (r'\bin lo\b', 'nello'),
    (r'\bin la\b', 'nella'),
    (r'\bin i\b', 'nei'),
    (r'\bin gli\b', 'negli'),
    (r'\bin le\b', 'nelle'),
    (r'\bsu il\b', 'sul'),
    (r'\bsu lo\b', 'sullo'),
    (r'\bsu la\b', 'sulla'),
    (r'\bsu i\b', 'sui'),
    (r'\bsu gli\b', 'sugli'),
    (r'\bsu le\b', 'sulle'),
]


def _check_uncontracted_prepositions(text: str) -> list[dict]:
    findings = []
    for pattern, correct in _UNCONTRACTED:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            findings.append({
                "severity": "error",
                "rule": "preposizione_non_contratta",
                "message": f"Preposizione articolata non contratta: '{m.group()}' → '{correct}'.",
            })
    return findings


_UNITS = ['cm', 'mm', 'km', 'kg', 'mg', 'ml', 'kW', 'GB', 'MB', 'TB', 'g', 'm', 'L', 'W']
_UNIT_RE = re.compile(r'\d(' + '|'.join(re.escape(u) for u in _UNITS) + r')\b')


def _check_unit_spacing(text: str) -> list[dict]:
    m = _UNIT_RE.search(text)
    if m:
        return [{
            "severity": "review",
            "rule": "unita_misura_spazio",
            "message": f"Unità di misura attaccata al numero senza spazio: '{m.group()}'. Forma corretta: con spazio.",
        }]
    return []


def run_all_checks(
    text: str,
    domain: str = "universale",
    dictionary_dir: str | None = None,
) -> list[dict]:
    findings: list[dict] = []
    findings += _check_straight_quotes(text)
    findings += _check_currency_spacing(text)
    findings += _check_percent_spacing(text)
    findings += _check_uncontracted_prepositions(text)
    if domain == "prodotto-digitale-ecommerce":
        findings += _check_unit_spacing(text)
    return findings


def check_glossary_terms(
    source_text: str,
    target_text: str,
    glossary_terms: list[dict],
) -> list[dict]:
    findings = []
    for entry in glossary_terms:
        source_term = entry.get('source_term', '')
        target_term = entry.get('target_term', '')
        note = entry.get('note') or ''
        if not source_term or not target_term:
            continue
        if re.search(re.escape(source_term), source_text, re.IGNORECASE):
            if not re.search(re.escape(target_term), target_text, re.IGNORECASE):
                msg = (
                    f"Termine glossario non trovato: '{source_term}' (fonte) → "
                    f"'{target_term}' (resa attesa)."
                )
                if note:
                    msg += f" Nota: {note}"
                findings.append({
                    "severity": "error",
                    "rule": "glossario_termine_mancante",
                    "message": msg,
                })
    return findings
