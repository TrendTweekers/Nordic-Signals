"""
Classifies new job postings via OpenAI (gpt-4o-mini) into department / specialty /
seniority / signal tags. Reads today's diff, writes data/classified/YYYY-MM-DD.json.

Cost: ~$0.001 per job at 4o-mini pricing. 200 new jobs/week ~ $0.20/week.
"""
import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

ROOT = Path(__file__).parent
DIFF_DIR = ROOT / "data" / "diffs"
OUT_DIR = ROOT / "data" / "classified"
OUT_DIR.mkdir(parents=True, exist_ok=True)

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

SYSTEM = """You classify tech job postings into structured signals for a Nordic AI/infra hiring tracker.

Return strict JSON with these fields:
- department: one of [Engineering, Product, Data, Design, Sales, Marketing, Operations, People, Finance, Legal, Other]
- specialty: short tag (e.g. "ML Infrastructure", "Backend", "DevRel", "Security", "Frontend", "Hardware", "Autonomy")
- seniority: one of [Intern, Junior, Mid, Senior, Staff, Principal, Lead, Manager, Director, VP, Other]
- ai_signal: boolean — true if the role indicates AI/ML capability building (not just "uses AI")
- infra_signal: boolean — true if it indicates platform/infra/scaling investment
- summary: one sentence on what this role implies about the company's direction

Be terse. No prose outside JSON."""


def classify_one(job):
    prompt = f"Title: {job['title']}\nCompany: {job['company']}\nLocation: {job.get('location','')}"
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": SYSTEM}, {"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    try:
        return json.loads(resp.choices[0].message.content)
    except json.JSONDecodeError:
        return {"department": "Other", "specialty": "", "seniority": "Other",
                "ai_signal": False, "infra_signal": False, "summary": ""}


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
