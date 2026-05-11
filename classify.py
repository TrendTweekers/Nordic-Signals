"""
Classifies new job postings via Anthropic Claude Haiku 4.5.

Parallel by default: AsyncAnthropic with a Semaphore(12). System prompt
is prompt-cached (5-min TTL) so repeat input tokens within the run get
a 90% discount.

A first run after expanding the company list can produce thousands of
"added" rows; CLASSIFY_LIMIT caps the per-run workload to keep latency
sane. The cap only trims the digest, not the snapshot.
"""
import asyncio
import json
import os
from pathlib import Path

from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent
DIFF_DIR = ROOT / "data" / "diffs"
OUT_DIR = ROOT / "data" / "classified"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "claude-haiku-4-5"
CONCURRENCY = 5   # Stay well under Anthropic tier-1 50 RPM. 5 concurrent ~ peak 40-45 RPM.
CLASSIFY_LIMIT = int(os.environ.get("CLASSIFY_LIMIT", "1500"))
MAX_RETRIES = 3

client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM = """You classify tech job postings into structured signals for a Nordic AI/infra hiring tracker.
Your job is to surface roles that meaningfully shift a VC or sales rep's view of a company.

Return strict JSON with these fields:

- department: one of [Engineering, Product, Data, Design, Sales, Marketing, Operations, People, Finance, Legal, Other]
- specialty: short tag (e.g. "ML Infrastructure", "Backend", "DevRel", "Security", "Frontend", "Hardware", "Autonomy", "Foundation Models", "Inference", "Robotics")
- seniority: one of [Intern, Junior, Mid, Senior, Staff, Principal, Lead, Manager, Director, VP, C-Level, Other]

- ai_signal: true ONLY if the role builds AI/ML capability for the company (ML engineer, AI researcher, MLOps, applied AI, foundation models, etc.). NOT true for roles that merely use AI tools or have "AI" in the title without substantive ML work (e.g. "AI-augmented Marketing Manager").

- infra_signal: true if the role indicates platform / infra / scaling investment (Platform Eng, SRE, DevOps, Cloud Architect, Data Platform, Internal Tooling). NOT true for generic backend roles.

- is_relevant: true if this role belongs in a Nordic tech-hiring signal digest.
  INCLUDE: Engineering, Data, ML/AI, Product (technical PM), Design (UX/Product), Security, DevOps, Hardware, Robotics. INCLUDE ALL leadership_hire roles regardless of function — those are always strategic. INCLUDE Head/VP/Director/C-Level roles even in non-tech functions (CFO, Chief of Staff, VP People, Head of Legal — these are strategic signals).
  EXCLUDE: rank-and-file Sales/Account Manager/SDR/BDR/Marketing/Brand/PR/Customer Success/Customer Service/Retail/Grocery/Category/Compliance Outsourcing/Logistics Associate/Driver/Courier/Recruiter/Talent Sourcer/Office Manager/Receptionist/Administrative Assistant.
  When in doubt, set true.

- leadership_hire: true ONLY for roles at Director / VP / C-Level / Chief / Head-of seniority that are STRATEGIC signals: "Head of AI", "VP Engineering", "CFO", "Chief of Staff", "Head of Platform", "GM <Region>". This is the high-value VC signal — a first CFO usually precedes a fundraise or IPO prep; a first Head of AI usually precedes a product capability launch.

- strategic_signal: short tag if the role implies a directional bet, otherwise empty string. Use values like:
  • "first-ai-capability" — first dedicated AI/ML role at a company that previously had none
  • "ai-infra-scaleup" — Staff/Principal-level ML or platform infra hire
  • "fundraise-prep" — CFO, Head of FP&A, VP Finance, IPO-readiness role
  • "international-expansion" — GM <Region>, Country Manager, Head of <Market>
  • "hardware-bet" — Robotics/Embedded/Silicon hardware role at a software-first company
  • "compliance-buildout" — Head of Legal, DPO, Compliance Officer (often signals regulated-market push)
  • "" — no notable strategic signal
  Be conservative — only flag when the title makes the bet unambiguous from the one row alone.

- summary: one sentence on what this role implies about the company's direction. Concrete, not generic.

Output ONLY the JSON object. No markdown fences, no prose, no preamble."""


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "department": "Other", "specialty": "", "seniority": "Other",
            "ai_signal": False, "infra_signal": False,
            "is_relevant": False, "leadership_hire": False, "strategic_signal": "",
            "summary": "",
        }


async def classify_one(sem, job):
    async with sem:
        prompt = f"Title: {job['title']}\nCompany: {job['company']}\nLocation: {job.get('location','')}"
        last_err = None
        for attempt in range(MAX_RETRIES):
            try:
                resp = await client.messages.create(
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
            except Exception as e:
                last_err = e
                msg = str(e)
                # Exponential backoff on rate-limit / overload: 2s, 4s, 8s.
                if "429" in msg or "rate_limit" in msg.lower() or "overloaded" in msg.lower():
                    await asyncio.sleep(2 ** (attempt + 1))
                    continue
                break  # non-retryable
        print(f"  classify error for {job.get('company','?')}::{job.get('title','?')}: {last_err}", flush=True)
        # Fallback marks as NOT relevant — a failed classification shouldn't
        # leak noise into the curated digest. The job remains in the snapshot.
        return {
            "department": "Other", "specialty": "", "seniority": "Other",
            "ai_signal": False, "infra_signal": False,
            "is_relevant": False, "leadership_hire": False, "strategic_signal": "",
            "summary": "",
        }


async def main():
    files = sorted(DIFF_DIR.glob("*.json"))
    if not files:
        raise SystemExit("No diffs found. Run diff.py first.")
    diff = json.loads(files[-1].read_text(encoding="utf-8"))

    added = diff["added"]
    if len(added) > CLASSIFY_LIMIT:
        print(f"Diff has {len(added)} added roles; capping classify to first {CLASSIFY_LIMIT}", flush=True)
        added = added[:CLASSIFY_LIMIT]

    sem = asyncio.Semaphore(CONCURRENCY)
    print(f"Classifying {len(added)} roles with {CONCURRENCY} concurrent...", flush=True)

    tasks = [classify_one(sem, j) for j in added]
    tags_list = await asyncio.gather(*tasks)
    enriched = [{**j, **t} for j, t in zip(added, tags_list)]

    out = OUT_DIR / f"{diff['date']}.json"
    out.write_text(json.dumps({
        "date": diff["date"],
        "added": enriched,
        "removed": diff["removed"],
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nClassified {len(enriched)} jobs -> {out}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
