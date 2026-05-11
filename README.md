# Nordic Signals

Automated tracker for Nordic AI / infra hiring signals. Scrapes ~40 startup career pages daily, classifies new roles via GPT-4o-mini, and emails a weekly digest every Monday.

## How it works

```
scrape.py    -> data/snapshots/YYYY-MM-DD.json   (all jobs today)
diff.py      -> data/diffs/YYYY-MM-DD.json       (added / removed vs yesterday)
classify.py  -> data/classified/YYYY-MM-DD.json  (added jobs + ML/infra tags)
notify.py    -> Resend email                      (Monday digest, last 7 days)
```

GitHub Actions runs `pipeline.py` every day at 06:00 UTC and `notify.py` only on Mondays. Snapshots are committed back to the repo so the next day's diff has yesterday to compare against.

## One-time setup

1. **Local install** (only needed if running locally for testing)
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python -m playwright install chromium
   ```

2. **Verify the company list**
   ATS slugs sometimes go stale. Open each URL once before first cron run:
   - Greenhouse: `https://boards.greenhouse.io/{slug}`
   - Lever: `https://jobs.lever.co/{slug}`
   - Ashby: `https://jobs.ashbyhq.com/{slug}`

   Edit `companies.json` and update / remove any 404s.

3. **GitHub repo secrets** (Settings → Secrets and variables → Actions)
   - `ANTHROPIC_API_KEY` — for the Claude Haiku classifier
   - `RESEND_API_KEY` — from resend.com (free tier covers this easily)
   - `DIGEST_FROM` — `onboarding@resend.dev` (or your verified Resend sender)
   - `DIGEST_TO` — your inbox

4. **First run**: trigger the workflow manually from the Actions tab. The first run produces a snapshot but nothing to diff against; from day 2 onward you'll get real signal data.

## Local test

```powershell
copy .env.example .env
# fill in OPENAI_API_KEY, RESEND_API_KEY, DIGEST_FROM, DIGEST_TO
python pipeline.py
python notify.py   # forces a digest email even mid-week
```

## Adding a company

Append to `companies.json`:

```json
{ "name": "NewCo", "ats": "greenhouse", "slug": "newco", "country": "SE", "tier": "growth" }
```

`tier` is informational only (scale / growth / early). `country` is ISO-2 (SE / NO / DK / FI / IS / EE).

## Cost

- GitHub Actions: free (under 2000 min/month even running daily)
- Resend: free tier (3k emails/month — way more than needed)
- Anthropic Claude Haiku 4.5: ~$0.001 per job classified with prompt caching, so <€0.20/month at this scale
- Total: effectively free

## Validation phase (weeks 1–4)

Forward each Monday digest manually to 10 hand-picked recipients (Stockholm recruiting agency founders, Nordic dev tool AEs, VC associates). Subject line: "fyi — Nordic AI hiring signals this week". Track replies. If 3+ ask to stay on the list, build the website (Phase 2).
