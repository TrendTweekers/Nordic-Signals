"""
Classifies new job postings via Anthropic Claude Haiku 4.5.

Cost: ~$0.001 per job at haiku-4-5 pricing with system-prompt caching.
The system prompt is cached (5-min TTL) so repeated runs within the same
batch get a 90% discount on those input tokens.
"""
import json
import os
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent
DIFF_DIR = ROOT / "data" / "diffs"
OUT_DIR = ROOT / "data" / "classified"
OUT_DIR.mkdir(parents=True, exist_ok=True)

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

MODEL = "claude-haiku-4-5"

SYSTEM = """You classify tech job postings into structured signals for a Nordic AI/infra hiring tracker.

Return strict JSON with these fields:
- department: one of [Engineering, Product, Data, Design, Sales, Marketing, Operations, People, Finance, Legal, Other]
- specialty: short tag (e.g. "ML Infrastructure", "Backend", "DevRel", "Security", "Frontend", "Hardware", "Autonomy")
- seniority: one of [Intern, Junior, Mid, Senior, Staff, Principal, Lead, Manager, Director, VP, Other]
- ai_signal: boolean — true if the role builds AI/ML capability (not just "uses AI")
- infra_signal: boolean — true if it indicates platform/infra/scaling investment
- summary: one sentence on what this role implies about the company's direction

Output ONLY the JSON object. No markdown fences, no prose, no preamble."""


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        # Strip ```json ... ``` fences if the model adds them
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "department": "Other", "specialty": "", "seniority": "Other",
            "ai_signal": False, "infra_signal": False, "summary": "",
        }


def classify_one(job):
    prompt = f"Title: {job['title']}\nCompany: {job['company']}\nLocation: {job.get('location','')}"
    resp = client.messages.create(
        model=MODEL,
        max_tokens=400,
        temperature=0.1,
        system=[{
            "type": "text",
            "text": SYSTEM,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in resp.content if hasattr(b, "text"))
    return _extract_json(text)


def main():
    files = sorted(DIFF_DIR.glob("*.json"))
    if not files:
        raise SystemExit("No diffs found. Run diff.py first.")
    diff = json.loads(files[-1].read_text(encoding="utf-8"))

    enriched = []
    for j in diff["added"]:
        tags = classify_one(j)
        enriched.append({**j, **tags})
        print(f"  {j['company']} :: {j['title']} -> {tags.get('specialty','')} ({tags.get('seniority','')})", flush=True)

    out = OUT_DIR / f"{diff['date']}.json"
    out.write_text(json.dumps({
        "date": diff["date"],
        "added": enriched,
        "removed": diff["removed"],
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nClassified {len(enriched)} jobs -> {out}", flush=True)


if __name__ == "__main__":
    main()
