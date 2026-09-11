#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path
from evaluation_agent import ItalianEvaluationAgent

UNLOCK_MSG = '[Sblocca il report completo per il dettaglio]'


def load_batch(input_file: str) -> dict:
    if input_file.endswith('.json'):
        with open(input_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    raise ValueError("Input must be .json")


def evaluate_batch(agent: ItalianEvaluationAgent, batch: dict, json_output_path: str) -> dict:
    """Evaluate batch of texts and save raw results to json_output_path."""
    results = []
    for i, text in enumerate(batch.get('texts', [])):
        result = agent.evaluate(
            text,
            document_id=f"{batch.get('document_id', 'batch')}_{i}",
            context=batch.get('context', {})
        )
        results.append(result)

    avg_score = sum(r.get('score', 0) for r in results) / len(results) if results else 0

    report = {
        'batch_id': batch.get('document_id', 'batch'),
        'num_texts': len(batch.get('texts', [])),
        'context': batch.get('context', {}),
        'results': results,
        'avg_score': avg_score,
    }

    with open(json_output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"✅ Raw JSON saved: {json_output_path}")

    return report


def _truncate_issue(text: str, max_words: int = 15) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return ' '.join(words[:max_words]) + '… ' + UNLOCK_MSG


def _render_result_html(result: dict, mode: str) -> str:
    grade_class = result.get('grade', 'acceptable').lower()
    html = f"""
        <h2>📄 {result.get('document_id', 'Document')}</h2>
        <div style="margin-bottom: 20px;">
            <span class="grade {grade_class}">{result.get('grade', 'N/A')} ({result.get('score', 0)}/100)</span>
        </div>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">{result.get('summary', 'No summary')}</p>
"""

    errors = result.get('errors', [])
    if errors:
        html += '<div class="errors"><h3>Errors Found</h3>'
        for error in errors:
            severity_class = error.get('severity', 'minor').lower()
            if mode == 'sample':
                issue_text = _truncate_issue(error.get('issue', 'N/A'))
                suggestion_html = ''
            else:
                issue_text = error.get('issue', 'N/A')
                suggestion_html = f'<div class="suggestion"><strong>Suggestion:</strong> {error.get("suggestion", "N/A")}</div>'

            html += f"""
            <div class="error-item">
                <span class="error-severity {severity_class}">{error.get('severity', 'minor').upper()}</span>
                <strong>{error.get('category', 'N/A')}</strong>
                <div class="error-text"><strong>Issue:</strong> {issue_text}</div>
                {suggestion_html}
            </div>
"""
        html += '</div>'

    strengths = result.get('strengths', [])
    if strengths:
        html += '<div class="strengths"><h3>Strengths</h3>'
        if mode == 'sample':
            html += f'<div class="strength-item">✓ {strengths[0]}</div>'
            extra = len(strengths) - 1
            if extra > 0:
                html += f'<div class="locked-note">+ {extra} altri disponibili nel report completo</div>'
        else:
            for strength in strengths:
                html += f'<div class="strength-item">✓ {strength}</div>'
        html += '</div>'

    actions = result.get('recommended_actions', [])
    if actions:
        html += '<div class="actions"><h3>Recommended Actions</h3>'
        if mode == 'sample':
            html += f'<div class="action-item">→ {actions[0]}</div>'
            extra = len(actions) - 1
            if extra > 0:
                html += f'<div class="locked-note">+ {extra} altri disponibili nel report completo</div>'
        else:
            for action in actions:
                html += f'<div class="action-item">→ {action}</div>'
        html += '</div>'

    return html


def _html_head(mode: str) -> str:
    sample_banner = ''
    if mode == 'sample':
        sample_banner = """
        .sample-banner { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;
            padding: 14px 20px; margin-bottom: 30px; color: #664d03; font-size: 14px; }
        .sample-banner strong { color: #856404; }
        .locked-note { padding: 8px 12px; margin-top: 6px; margin-bottom: 8px;
            background: #f8f9fa; border-left: 4px solid #adb5bd; border-radius: 3px;
            color: #6c757d; font-size: 13px; font-style: italic; }
"""
    return f"""<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Italian QA Evaluation Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 1000px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 40px; }}
        h1 {{ color: #333; margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 15px; }}
        h2 {{ color: #555; margin-top: 30px; margin-bottom: 15px; font-size: 18px; }}
        .summary {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }}
        .stat {{ padding: 20px; background: #f9f9f9; border-radius: 6px; text-align: center; border-left: 4px solid #007bff; }}
        .stat-value {{ font-size: 32px; font-weight: bold; color: #007bff; }}
        .stat-label {{ color: #777; font-size: 13px; margin-top: 5px; }}
        .grade {{ display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }}
        .grade.excellent {{ background: #d4edda; color: #155724; }}
        .grade.good {{ background: #cfe2ff; color: #084298; }}
        .grade.acceptable {{ background: #fff3cd; color: #664d03; }}
        .grade.poor {{ background: #f8d7da; color: #842029; }}
        .errors {{ margin-top: 20px; }}
        .error-item {{ padding: 15px; margin-bottom: 12px; background: #fff8f0; border-left: 4px solid #dc3545; border-radius: 4px; }}
        .error-severity {{ display: inline-block; padding: 4px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }}
        .critical {{ background: #dc3545; color: white; }}
        .major {{ background: #fd7e14; color: white; }}
        .minor {{ background: #17a2b8; color: white; }}
        .error-text {{ color: #666; font-size: 13px; margin-top: 8px; }}
        .suggestion {{ margin-top: 8px; padding: 8px; background: #e7f3ff; border-radius: 3px; color: #004085; font-size: 13px; }}
        .strengths, .actions {{ margin-top: 20px; }}
        .strength-item, .action-item {{ padding: 10px; margin-bottom: 8px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 3px; color: #2e7d32; }}
        .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }}
        .cta-box {{ margin-top: 40px; padding: 28px 32px; background: #f0f7ff; border: 2px solid #007bff; border-radius: 8px; text-align: center; }}
        .cta-box h3 {{ color: #004099; margin-bottom: 10px; font-size: 18px; }}
        .cta-box p {{ color: #555; margin-bottom: 18px; line-height: 1.6; }}
        .cta-btn {{ display: inline-block; padding: 12px 28px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 15px; }}
        .cta-btn:hover {{ background: #0056b3; }}
        .signature {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #555; }}
        .signature a {{ color: #007bff; text-decoration: none; }}{sample_banner}
    </style>
</head>
<body>
    <div class="container">
"""


def _html_footer() -> str:
    return """
        <div class="cta-box">
            <h3>Want a professional Italian linguistic QA review?</h3>
            <p>Book a free discovery call to discuss how we can help you deliver flawless Italian content — from UI copy to long-form translation.</p>
            <a class="cta-btn" href="https://linguisticqa.com" target="_blank">Visit linguisticqa.com</a>
        </div>

        <div class="signature">
            <p><strong>Alessio Di Rubbo</strong> — Italian Linguistic QA Specialist<br>
            <a href="mailto:alessio.drb@gmail.com">alessio.drb@gmail.com</a> &nbsp;|&nbsp;
            <a href="https://linguisticqa.com" target="_blank">linguisticqa.com</a> &nbsp;|&nbsp;
            <a href="https://linkedin.com/in/alessiodirubbo" target="_blank">LinkedIn</a></p>
        </div>

        <div class="footer">
            <p>Generated by Italian Linguistic QA Agent</p>
        </div>
    </div>
</body>
</html>
"""


def generate_html_report(report: dict, output_file: str, mode: str = 'full'):
    """Generate HTML report from a report dict."""
    html = _html_head(mode)
    html += '        <h1>Italian Linguistic QA Evaluation Report</h1>\n'

    if mode == 'sample':
        html += """        <div class="sample-banner">
            <strong>Anteprima campione.</strong> Suggerimenti dettagliati, ulteriori punti di forza e azioni consigliate sono disponibili nel report completo.
            Contatta <a href="mailto:alessio.drb@gmail.com">alessio.drb@gmail.com</a> per riceverlo.
        </div>
"""

    html += f"""        <div class="summary">
            <div class="stat">
                <div class="stat-value">{report['avg_score']:.0f}</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat">
                <div class="stat-value">{report['num_texts']}</div>
                <div class="stat-label">Texts Evaluated</div>
            </div>
            <div class="stat">
                <div class="stat-value">{report['batch_id']}</div>
                <div class="stat-label">Batch ID</div>
            </div>
        </div>
"""

    for result in report['results']:
        html += _render_result_html(result, mode)

    html += _html_footer()

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"✅ HTML report saved: {output_file}")


def generate_html_from_json(json_path: str, output_html: str, mode: str = 'full'):
    """Generate HTML from a previously saved raw JSON — no API calls."""
    with open(json_path, 'r', encoding='utf-8') as f:
        report = json.load(f)
    generate_html_report(report, output_html, mode)


def _json_path_for(output_html: str) -> str:
    return str(Path(output_html).with_suffix('.json'))


def main():
    parser = argparse.ArgumentParser(description="Italian QA Evaluation Tool")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--input', help="Input batch file (.json) — calls the AI agent")
    group.add_argument('--from-json', metavar='JSON', help="Path to existing raw results JSON — no API calls")
    parser.add_argument('--output', default='report.html', help="Output HTML file (default: report.html)")
    parser.add_argument('--rubric', default='../framework/italian-evaluation-framework.md')
    parser.add_argument('--mode', choices=['full', 'sample'], default='full',
                        help="Report mode: full (default) or sample (truncated)")

    args = parser.parse_args()

    if args.from_json:
        if not Path(args.from_json).exists():
            print(f"❌ JSON file not found: {args.from_json}")
            sys.exit(1)
        print(f"📄 Generating {args.mode} HTML from {args.from_json} (no API calls)...")
        generate_html_from_json(args.from_json, args.output, args.mode)
        return

    # --input path: call agent
    if not Path(args.rubric).exists():
        print(f"❌ Rubric not found: {args.rubric}")
        sys.exit(1)
    if not Path(args.input).exists():
        print(f"❌ Input file not found: {args.input}")
        sys.exit(1)

    agent = ItalianEvaluationAgent(args.rubric)
    batch = load_batch(args.input)

    json_out = _json_path_for(args.output)
    print(f"📊 Evaluating {len(batch.get('texts', []))} text(s)...")
    report = evaluate_batch(agent, batch, json_out)

    generate_html_report(report, args.output, args.mode)
    print(f"\nAverage score: {report['avg_score']:.1f}/100")


if __name__ == "__main__":
    main()
