import anthropic
import json
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv('../../.env')

class ItalianEvaluationAgent:
    def __init__(self, rubric_path: str, glossary_path: Optional[str] = None, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
        self.rubric = self._load_rubric(rubric_path)
        self.glossary = self._load_glossary(glossary_path) if glossary_path else None
        self.model = "claude-opus-5"
    
    def _load_rubric(self, path: str) -> str:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def _load_glossary(self, path: str) -> dict:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def evaluate(self, text: str, document_id: str = "sample", context: Optional[dict] = None) -> dict:
        context = context or {}
        system_prompt = self._build_system_prompt(context)
        
        user_message = f"""Evaluate this Italian text:

{text}

Respond ONLY with valid JSON."""
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )
        
        try:
            # Find the text block (skip thinking blocks)
            text_content = None
            for block in response.content:
                if hasattr(block, 'text'):
                    text_content = block.text
                    break
            
            if not text_content:
                raise ValueError("No text response from Claude")
            
            result = json.loads(text_content)
            result['document_id'] = document_id
            return result
        except json.JSONDecodeError as e:
            return {'document_id': document_id, 'error': str(e), 'raw': text_content if text_content else 'No text'}
    
    def _build_system_prompt(self, context: dict) -> str:
        return f"""You are an expert Italian linguist. Evaluate the Italian text according to this rubric and output ONLY valid JSON with score (0-100), grade, summary, errors, strengths, recommended_actions.

{self.rubric}"""

if __name__ == "__main__":
    agent = ItalianEvaluationAgent("../framework/italian-evaluation-framework.md")
    result = agent.evaluate("Aggiungi il prodotto nel carrello adesso", document_id="test_1")
    print(json.dumps(result, indent=2, ensure_ascii=False))
