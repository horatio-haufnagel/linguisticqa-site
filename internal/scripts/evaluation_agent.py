import json
import os
from pathlib import Path
from typing import Optional

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_ENV_PATH = SCRIPT_DIR.parent.parent / ".env"


def _load_env_file(path: Path) -> None:
    """Minimal .env loader (no python-dotenv dependency required)."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_load_env_file(DEFAULT_ENV_PATH)

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
DEFAULT_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-5")


class ItalianEvaluationAgent:
    def __init__(self, rubric_path: str, glossary_path: Optional[str] = None,
                 api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY non trovata. Impostala nel file .env "
                f"({DEFAULT_ENV_PATH}) o come variabile d'ambiente."
            )
        self.rubric = self._load_rubric(rubric_path)
        self.glossary = self._load_glossary(glossary_path) if glossary_path else None
        self.model = model or DEFAULT_MODEL

    def _load_rubric(self, path: str) -> str:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()

    def _load_glossary(self, path: str) -> dict:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def evaluate(self, text: str, document_id: str = "sample", context: Optional[dict] = None,
                 source_text: Optional[str] = None, source_lang: Optional[str] = None,
                 extra_context: str = "") -> dict:
        context = context or {}
        system_prompt = self._build_system_prompt(context, has_source=bool(source_text))
        if extra_context:
            system_prompt += "\n\n" + extra_context

        if source_text:
            user_message = f"""SOURCE TEXT ({source_lang or 'unknown'}): {source_text}
TARGET TEXT (Italian): {text}

Compare the target against the source and evaluate according to the rubric, including ACCURATEZZA.

Respond ONLY with valid JSON."""
        else:
            user_message = f"""Evaluate this Italian text:

{text}

Respond ONLY with valid JSON."""

        payload = {
            "model": self.model,
            "max_tokens": 4000,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
        }
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        }

        try:
            response = requests.post(ANTHROPIC_API_URL, headers=headers, json=payload, timeout=120)
        except requests.RequestException as e:
            return {
                'document_id': document_id,
                'error': f"API call failed (network): {str(e)}",
                'score': None,
                'grade': 'Error',
                'summary': f"Network error calling Anthropic API: {str(e)}"
            }

        if response.status_code != 200:
            return {
                'document_id': document_id,
                'error': f"API call failed: HTTP {response.status_code} — {response.text[:500]}",
                'score': None,
                'grade': 'Error',
                'summary': f"Anthropic API returned {response.status_code}. Check ANTHROPIC_API_KEY and model name ({self.model})."
            }

        data = response.json()

        text_content = None
        for block in data.get('content', []):
            if block.get('type') == 'text' and block.get('text'):
                text_content = block['text']
                break

        if not text_content:
            return {
                'document_id': document_id,
                'error': "No text block found in response (only thinking/other blocks returned)",
                'score': None,
                'grade': 'Error',
                'summary': "Evaluation failed: Claude returned no usable text output."
            }

        cleaned = text_content.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        cleaned = cleaned.strip()

        try:
            result = json.loads(cleaned)
            result['document_id'] = document_id
            return result
        except json.JSONDecodeError as e:
            return {
                'document_id': document_id,
                'error': f"JSON parse failed: {str(e)}",
                'raw': text_content,
                'score': None,
                'grade': 'Error',
                'summary': "Evaluation completed but response could not be parsed as JSON. Raw output logged."
            }

    def _build_system_prompt(self, context: dict, has_source: bool = False) -> str:
        base = f"""You are an expert Italian linguist. Evaluate the Italian text according to this rubric and output ONLY valid JSON with score (0-100), grade, summary, errors, strengths, recommended_actions.

{self.rubric}"""

        if not has_source:
            # No source text for this item: behave exactly as before v2 (no ACCURATEZZA
            # category, no accuracy_issues field, do not guess at what the source said).
            return base

        return base + """

A SOURCE TEXT was provided for this item. Apply the ACCURATEZZA category from the rubric above by
comparing the TARGET TEXT against the SOURCE TEXT given in the user message.
Report accuracy findings separately in a dedicated "accuracy_issues" JSON array (can be empty),
NOT inside "errors". Each element must have this exact shape:
{"severity": "critical"|"major"|"minor", "source_quote": "...", "target_quote": "...", "issue": "..."}
"source_quote" and "target_quote" MUST be exact, verbatim substrings copied from the SOURCE TEXT and
TARGET TEXT given in the user message; do not paraphrase, translate, or summarize them. If you
cannot quote an exact substring for both, omit that issue entirely rather than inventing one.
The final "score" must incorporate the ACCURATEZZA deductions from accuracy_issues together with the
deductions from "errors"."""


if __name__ == "__main__":
    agent = ItalianEvaluationAgent(str(SCRIPT_DIR.parent / "framework" / "italian-evaluation-framework.md"))
    result = agent.evaluate("Aggiungi il prodotto nel carrello adesso", document_id="test_1")
    print(json.dumps(result, indent=2, ensure_ascii=False))
