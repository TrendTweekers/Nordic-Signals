"""
Builds the weekly digest from the last 7 days of classified diffs and emails it via Resend.
Run this on Mondays only (the GitHub Actions workflow gates this).
"""
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent
CLASSIFIED_DIR = ROOT / "data" / "classified"

RESEND_API_KEY = os.environ["RESEND_API_KEY"]
DIGEST_FROM = os.environ["DIGEST_FROM"]
DIGEST_TO = os.environ["DIGEST_TO"]


def load_week():
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).date()
    files = sorted(CLASSIFIED_DIR.glob("*.json"))
    week = []
    for f in files:
        d = datetime.strptime(f.stem, "%Y-%m-%d").date()
        if d >= cutoff:
            week.append(json.loads(f.read_text(encoding="utf-8")))
    return week


SIGNAL_CONTEXT = {
    "first-ai-capability": "First dedicated AI/ML role — likely standing up in-house ML capability",
    "ai-infra-scaleup":    "Staff/Principal platform investment — scaling pressure",
    "fundraise-prep":      "Senior finance/IPO-readiness hire — fundraise or exit prep",
    "international-expansion": "Country/regional GM — new-market push",
    "hardware-bet":        "Specialized hardware/robotics hire — physical product investment",
    "compliance-buildout": "Senior legal/compliance hire — regulated-market entry",
    "organizational-scaling": "Senior people/ops hire — headcount ramp ahead",
}

SENIOR = {"Staff", "Principal", "Lead", "Manager", "Director", "VP", "C-Level"}


def role_score(j):
    s = 0
    if j.get("strategic_signal"): s += 100
    if j.get("leadership_hire"):  s += 50
    if j.get("ai_signal"):        s += 20
    if j.get("infra_signal"):     s += 15
    if (j.get("seniority") or "") in SENIOR: s += 5
    return s


def signal_oneliner(j):
    sig = j.get("strategic_signal")
    if sig and sig in SIGNAL_CONTEXT:
        return SIGNAL_CONTEXT[sig]
    if j.get("leadership_hire"):
        return f"New {j.get('seniority','senior')}-level leadership in {j.get('specialty','their team')}"
    if j.get("ai_signal"):
        return "Direct AI/ML capability build"
    if j.get("infra_signal"):
        return "Platform/infra investment"
    return ""


def build_html(week):
    added = [j for day in week for j in day.get("added", [])]
    removed = [j for day in week for j in day.get("removed", [])]
    relevant = [j for j in added if j.get("is_relevant", True)]
    ai_roles = [j for j in relevant if j.get("ai_signal")]
    infra_roles = [j for j in relevant if j.get("infra_signal")]
    leadership_roles = [j for j in relevant if j.get("leadership_hire")]
    strategic_roles = [j for j in relevant if j.get("strategic_signal")]

    # Top-N "high-impact" picks: pick best role per company, then top 8 overall
    best_per_company = {}
    for j in relevant:
        sc = role_score(j)
        if sc < 50:  # require leadership_hire OR strategic_signal
            continue
        cur = best_per_company.get(j["company"])
        if not cur or sc > role_score(cur):
            best_per_company[j["company"]] = j
    high_impact = sorted(best_per_company.values(), key=role_score, reverse=True)[:8]

    by_company = defaultdict(list)
    for j in relevant:
        by_company[j["company"]].append(j)

    today_str = datetime.now(timezone.utc).strftime("%b %d, %Y")

    def role_li(j):
        tag = " · ".join(filter(None, [j.get("seniority"), j.get("specialty")]))
        return f'<li><a href="{j["url"]}" style="color:#22d3ee;text-decoration:none">{j["title"]}</a> <span style="color:#94a3b8">— {tag}</span></li>'

    headline_blocks = []

    # === TL;DR — the 6-8 highest-impact signals, with one-liner context ===
    if high_impact:
        rows = []
        for j in high_impact:
            ctx = signal_oneliner(j)
            sig = j.get("strategic_signal") or ""
            sig_html = (
                f' <span style="color:#fbbf24;font-size:12px">· {sig}</span>' if sig else ""
            )
            ctx_html = (
                f'<br><span style="color:#94a3b8;font-size:13px">↳ {ctx}</span>' if ctx else ""
            )
            rows.append(
                f"<li style='margin-bottom:10px'>"
                f"<b style='color:#fff'>{j['company']}</b> — "
                f"<a href='{j['url']}' style='color:#22d3ee;text-decoration:none'>{j['title']}</a>"
                f"{sig_html}"
                f"{ctx_html}"
                f"</li>"
            )
        headline_blocks.append(
            f"<h2 style='color:#fff;font-size:20px;margin-top:32px;border-left:3px solid #22d3ee;padding-left:10px'>"
            f"🔥 {len(high_impact)} high-impact signals this week</h2>"
            "<ul style='padding-left:20px;line-height:1.5'>" + "".join(rows) + "</ul>"
        )

    # Strategic signals — highest impact, surfaced first
    if strategic_roles:
        # group by strategic_signal type
        from collections import defaultdict as _dd
        by_signal = _dd(list)
        for j in strategic_roles:
            by_signal[j["strategic_signal"]].append(j)
        rows = []
        for sig, jobs in sorted(by_signal.items(), key=lambda kv: -len(kv[1])):
            rows.append(f"<li><b style='color:#fbbf24'>{sig}</b> · " +
                        ", ".join(f"{j['company']} ({j['title']})" for j in jobs[:5]) + "</li>")
        headline_blocks.append(
            "<h2 style='color:#fff;font-size:18px;margin-top:32px'>⭐ Strategic moves</h2>"
            "<ul style='padding-left:20px;line-height:1.7'>" + "".join(rows) + "</ul>"
        )

    # Leadership hires — second-highest VC value
    if leadership_roles:
        headline_blocks.append(
            "<h2 style='color:#fff;font-size:18px;margin-top:32px'>👔 Leadership hires</h2>"
            "<ul style='padding-left:20px;line-height:1.7'>"
            + "".join(f"<li><b>{j['company']}</b> — {j['title']} <span style='color:#94a3b8'>({j.get('seniority','')})</span></li>"
                      for j in leadership_roles[:8])
            + "</ul>"
        )

    if ai_roles:
        headline_blocks.append(
            "<h2 style='color:#fff;font-size:18px;margin-top:32px'>🔥 AI capability signals</h2>"
            "<ul style='padding-left:20px;line-height:1.7'>"
            + "".join(f"<li><b>{j['company']}</b> — {j['title']}</li>" for j in ai_roles[:10])
            + "</ul>"
        )
    if infra_roles:
        headline_blocks.append(
            "<h2 style='color:#fff;font-size:18px;margin-top:32px'>⚙️ Infra / platform signals</h2>"
            "<ul style='padding-left:20px;line-height:1.7'>"
            + "".join(f"<li><b>{j['company']}</b> — {j['title']}</li>" for j in infra_roles[:10])
            + "</ul>"
        )

    # By-company section: only relevant roles, capped at 3/company, top 10
    # companies by signal score. Keeps it as a "notable companies" tail.
    relevant_by_company = {
        c: sorted(jobs, key=role_score, reverse=True)
        for c, jobs in by_company.items() if jobs
    }
    ranked = sorted(
        relevant_by_company.items(),
        key=lambda kv: (-max((role_score(j) for j in kv[1]), default=0), -len(kv[1])),
    )
    by_company_html = ""
    for company, jobs in ranked[:10]:
        head = jobs[:3]
        more = len(jobs) - len(head)
        more_html = f' <span style="color:#64748b;font-weight:400">+{more} more</span>' if more > 0 else ''
        by_company_html += (
            f"<h3 style='color:#fff;font-size:15px;margin-top:20px;margin-bottom:6px'>{company} "
            f"<span style='color:#64748b;font-weight:400'>{len(jobs)} relevant</span></h3>"
            "<ul style='padding-left:20px;line-height:1.6;margin:0'>"
            + "".join(role_li(j) for j in head)
            + (f"<li style='color:#64748b'>{more_html}</li>" if more else "")
            + "</ul>"
        )

    removed_html = ""
    if removed:
        removed_html = (
            "<h2 style='color:#fff;font-size:18px;margin-top:32px'>📉 Roles closed this week</h2>"
            "<ul style='padding-left:20px;line-height:1.7;color:#94a3b8'>"
            + "".join(f"<li>{j['company']} — {j['title']}</li>" for j in removed[:20])
            + "</ul>"
        )

    return f"""<!doctype html>
<html><body style="background:#0b1220;color:#cbd5e1;font-family:-apple-system,Segoe UI,Inter,sans-serif;margin:0;padding:24px">
  <div style="max-width:640px;margin:0 auto">
    <div style="border-bottom:1px solid #1e293b;padding-bottom:16px">
      <div style="color:#22d3ee;font-size:13px;letter-spacing:2px;text-transform:uppercase">Nordic Signals</div>
      <h1 style="color:#fff;font-size:26px;margin:8px 0 0">Weekly hiring signals — {today_str}</h1>
      <div style="color:#64748b;font-size:14px;margin-top:6px">{len(relevant)} relevant new roles · {len(removed)} closed · {len(by_company)} companies · {len(leadership_roles)} leadership · {len(strategic_roles)} strategic</div>
    </div>
    {''.join(headline_blocks)}
    <h2 style='color:#fff;font-size:18px;margin-top:32px'>Notable companies</h2>
    {by_company_html}
    {removed_html}
    <div style="border-top:1px solid #1e293b;margin-top:40px;padding-top:16px;color:#475569;font-size:12px">
      Tracking {len(set(j['company'] for day in week for j in day.get('added', []) + day.get('removed', [])))} active companies across the Nordics.
    </div>
  </div>
</body></html>"""


def send(html, subject):
    r = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        json={"from": DIGEST_FROM, "to": [DIGEST_TO], "subject": subject, "html": html},
        timeout=30,
    )
    r.raise_for_status()
    print(f"Sent: {r.json().get('id')}", flush=True)


def main():
    week = load_week()
    if not week:
        print("No classified data this week — skipping email.")
        return
    total_added = sum(len(d.get("added", [])) for d in week)
    subject = f"Nordic Signals — {total_added} new roles · {datetime.now(timezone.utc).strftime('%b %d')}"
    html = build_html(week)
    send(html, subject)


if __name__ == "__main__":
    main()
