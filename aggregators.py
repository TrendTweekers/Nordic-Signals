"""
Pulls Nordic jobs from public aggregator APIs and merges them into today's
snapshot. Runs AFTER scrape.py so we layer on coverage without changing
the direct-scrape pipeline.

Free sources:
  - Sweden: JobTech (Arbetsförmedlingen) — jobsearch.api.jobtechdev.se
  - Norway: NAV — pam-stilling-feed.nav.no (uses public rotating token)

Dedup: (company_lc, title_lc, city_lc) tuples already present in the snapshot
are skipped, so we don't double-count Wolt/Spotify/etc. that we already
scraped directly.
"""
import asyncio
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

ROOT = Path(__file__).parent
SNAPSHOT_DIR = ROOT / "data" / "snapshots"

# Search terms aimed at tech / AI / engineering roles.
TECH_QUERIES = [
    "software engineer", "developer", "data engineer", "machine learning",
    "platform engineer", "devops", "site reliability", "security engineer",
    "data scientist", "ML engineer", "AI engineer", "backend",
    "frontend", "full stack", "iOS", "Android", "cloud",
]

UA = "NordicSignals/1.0 (https://nordicsignals.com)"
SINCE_DAYS = 7  # only include postings published within the last N days


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").lower().strip())


def _dedup_key(j):
    title = _norm(j.get("title", ""))[:80]
    company = _norm(j.get("company", ""))
    city = _norm((j.get("location") or "").split(",")[0])[:30]
    return (company, title, city)


async def fetch_jobtech(client: httpx.AsyncClient) -> list[dict]:
    """Sweden — JobTech open data API. No auth."""
    since = (datetime.now(timezone.utc) - timedelta(days=SINCE_DAYS)).strftime("%Y-%m-%dT%H:%M:%S")
    out = []
    for q in TECH_QUERIES:
        try:
            r = await client.get(
                "https://jobsearch.api.jobtechdev.se/search",
                params={"q": q, "limit": 100, "published-after": since, "sort": "pubdate-desc"},
                headers={"Accept": "application/json", "User-Agent": UA},
                timeout=20,
            )
            if r.status_code != 200:
                print(f"  [JobTech '{q}'] status={r.status_code}", flush=True)
                continue
            data = r.json()
            for h in data.get("hits", []):
                out.append({
                    "title": h.get("headline", ""),
                    "url": (h.get("application_details") or {}).get("url") or h.get("webpage_url", ""),
                    "location": (h.get("workplace_address") or {}).get("municipality", "") or "",
                    "company": (h.get("employer") or {}).get("name", "") or "",
                    "country": "SE",
                    "tier": "aggregator",
                    "source": "jobtech",
                })
        except Exception as e:
            print(f"  [JobTech '{q}'] ERROR: {e}", flush=True)
    print(f"  JobTech raw: {len(out)} jobs across {len(TECH_QUERIES)} queries", flush=True)
    return out


async def fetch_nav(client: httpx.AsyncClient) -> list[dict]:
    """Norway — NAV public feed. Uses rotating public token. ACTIVE postings only."""
    out = []
    try:
        tr = await client.get("https://pam-stilling-feed.nav.no/api/publicToken", timeout=15)
        m = re.search(r"(eyJ[A-Za-z0-9_\-.]+)", tr.text)
        if not m:
            print("  [NAV] couldn't parse public token", flush=True)
            return out
        token = m.group(1)
        cutoff_iso = (datetime.now(timezone.utc) - timedelta(days=SINCE_DAYS)).strftime("%Y-%m-%dT%H:%M:%SZ")
        # Recent first via query param 'last' (NAV feed supports sistEndretEtter)
        params = {"size": 500, "sistEndretEtter": cutoff_iso}
        r = await client.get(
            "https://pam-stilling-feed.nav.no/api/v1/feed",
            params=params,
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
            timeout=30,
        )
        if r.status_code != 200:
            print(f"  [NAV] feed status={r.status_code}", flush=True)
            return out
        data = r.json()
        for item in data.get("items", []):
            entry = item.get("_feed_entry") or {}
            if entry.get("status") != "ACTIVE":
                continue
            uuid = entry.get("uuid") or item.get("id")
            out.append({
                "title": entry.get("title") or item.get("title", ""),
                "url": f"https://arbeidsplassen.no/stillinger/stilling/{uuid}" if uuid else "",
                "location": entry.get("municipal", "") or "",
                "company": entry.get("businessName", "") or "",
                "country": "NO",
                "tier": "aggregator",
                "source": "nav",
            })
    except Exception as e:
        print(f"  [NAV] ERROR: {e}", flush=True)
    print(f"  NAV raw: {len(out)} active jobs", flush=True)
    return out


async def main():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    snap_path = SNAPSHOT_DIR / f"{today}.json"
    if not snap_path.exists():
        print(f"No snapshot at {snap_path} — run scrape.py first.", flush=True)
        return

    snap = json.loads(snap_path.read_text(encoding="utf-8"))
    existing = {_dedup_key(j) for j in snap["jobs"]}
    print(f"Existing snapshot: {len(snap['jobs'])} jobs from direct scrapes", flush=True)

    async with httpx.AsyncClient() as client:
        jobtech, nav = await asyncio.gather(fetch_jobtech(client), fetch_nav(client))

    added_count = 0
    src_breakdown = {"jobtech": 0, "nav": 0}
    for j in jobtech + nav:
        if not j["title"] or not j["company"]:
            continue
        k = _dedup_key(j)
        if k in existing:
            continue
        existing.add(k)
        snap["jobs"].append(j)
        added_count += 1
        src_breakdown[j["source"]] += 1

    snap["total_jobs"] = len(snap["jobs"])
    snap["aggregators_run_at"] = datetime.now(timezone.utc).isoformat()
    snap_path.write_text(json.dumps(snap, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nMerged: +{added_count} new jobs (JobTech {src_breakdown['jobtech']}, NAV {src_breakdown['nav']})", flush=True)
    print(f"Snapshot now: {snap['total_jobs']} jobs total", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
