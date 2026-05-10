"""
Scrapes career pages and writes today's snapshot to data/snapshots/YYYY-MM-DD.json.

ATS-aware: each ATS (Greenhouse, Lever, Ashby) has stable URL + DOM patterns,
so we route by `ats` field rather than per-company selectors. When a company
moves ATS, you update companies.json — no scraper code change.
"""
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright, TimeoutError as PWTimeout

ROOT = Path(__file__).parent
SNAPSHOT_DIR = ROOT / "data" / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

ATS_URLS = {
    "greenhouse": "https://boards.greenhouse.io/{slug}",
    "lever": "https://jobs.lever.co/{slug}",
    "ashby": "https://jobs.ashbyhq.com/{slug}",
}


async def scrape_greenhouse(page, url):
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    try:
        await page.wait_for_selector(".opening, .job-post", timeout=10000)
    except PWTimeout:
        return []
    return await page.evaluate("""() => {
        const rows = document.querySelectorAll('.opening, .job-post');
        return Array.from(rows).map(r => {
            const a = r.querySelector('a');
            const loc = r.querySelector('.location, .job-post__location');
            return {
                title: a ? a.innerText.trim() : '',
                url: a ? a.href : '',
                location: loc ? loc.innerText.trim() : ''
            };
        }).filter(j => j.title && j.url);
    }""")


async def scrape_lever(page, url):
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    try:
        await page.wait_for_selector(".posting", timeout=10000)
    except PWTimeout:
        return []
    return await page.evaluate("""() => {
        const rows = document.querySelectorAll('.posting');
        return Array.from(rows).map(r => {
            const a = r.querySelector('a.posting-title, a');
            const title = r.querySelector('h5, .posting-name');
            const loc = r.querySelector('.posting-categories .location, .sort-by-location');
            return {
                title: title ? title.innerText.trim() : (a ? a.innerText.trim() : ''),
                url: a ? a.href : '',
                location: loc ? loc.innerText.trim() : ''
            };
        }).filter(j => j.title && j.url);
    }""")


async def scrape_ashby(page, url):
    await page.goto(url, wait_until="networkidle", timeout=30000)
    try:
        await page.wait_for_selector("a[href*='/lovable/'], a[href*='/jobs/']", timeout=10000)
    except PWTimeout:
        return []
    return await page.evaluate("""() => {
        const links = document.querySelectorAll("a[href*='/jobs/'], div[class*='JobPosting'] a");
        return Array.from(links).map(a => ({
            title: a.innerText.trim().split('\\n')[0],
            url: a.href,
            location: ''
        })).filter(j => j.title && j.url);
    }""")


SCRAPERS = {
    "greenhouse": scrape_greenhouse,
    "lever": scrape_lever,
    "ashby": scrape_ashby,
}


async def scrape_company(browser, company):
    ats = company["ats"]
    url = ATS_URLS[ats].format(slug=company["slug"])
    page = await browser.new_page()
    try:
        jobs = await SCRAPERS[ats](page, url)
        print(f"  [{company['name']}] {len(jobs)} roles", flush=True)
        return [{**j, "company": company["name"], "country": company["country"], "tier": company["tier"]} for j in jobs]
    except Exception as e:
        print(f"  [{company['name']}] ERROR: {e}", flush=True)
        return []
    finally:
        await page.close()


async def main():
    companies = json.loads((ROOT / "companies.json").read_text(encoding="utf-8"))["companies"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"Scraping {len(companies)} companies for {today}...", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        results = []
        for c in companies:
            jobs = await scrape_company(browser, c)
            results.extend(jobs)
        await browser.close()

    out = SNAPSHOT_DIR / f"{today}.json"
    out.write_text(json.dumps({
        "date": today,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "total_jobs": len(results),
        "jobs": results
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {len(results)} jobs to {out}", flush=True)
    return out


if __name__ == "__main__":
    sys.exit(asyncio.run(main()) and 0)
