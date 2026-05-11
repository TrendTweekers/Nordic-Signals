# Nordic Signals — Web

Next.js 15 + Tailwind v4 landing page. Dark mode, single-file marketing site, newsletter signup wired to a Resend audience.

## Local dev

```powershell
cd web
npm install
copy .env.example .env.local
# fill in RESEND_API_KEY and RESEND_AUDIENCE_ID
npm run dev
```

Open http://localhost:3000.

## Resend setup (one-time, 3 minutes)

The signup forms work with **just 3 env vars** — no audiences needed for the validation phase. Audience IDs are entirely optional and can be wired later.

1. Sign up at [resend.com](https://resend.com).
2. **API Keys → + Create API key** → name `Nordic Signals`, permission `Sending access`. Copy the `re_...` → `RESEND_API_KEY`.
3. That's it. For sender, use `onboarding@resend.dev` until you verify a real domain.

Set in Railway → Variables:
- `RESEND_API_KEY` — required
- `DIGEST_FROM` — `onboarding@resend.dev`
- `NOTIFY_TO` — your personal email (you get an email for every signup)

**Optional later** (when you want to send broadcasts from Resend itself):
- `RESEND_AUDIENCE_ID` — push general subscribers into a Resend audience
- `RESEND_PORTFOLIO_AUDIENCE_ID` — push portfolio waitlist into a separate audience
- `PORTFOLIO_NOTIFY_TO` — separate inbox for VC waitlist signups

## Deploy on Railway

1. New project → Deploy from GitHub repo → pick `Nordic-Signals`.
2. **Service Settings → Source → Root Directory: `web`** — without this, Railway builds from the repo root, sees `requirements.txt`, and tries to deploy the Python scraper. This is THE critical step.
3. Variables → add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`.
4. Networking → generate a Railway domain or attach a custom one (`nordicsignals.com`).

Railway uses Railpack (its current builder); `web/railpack.json` declares Node 20 + `npm run start`. The `start` script binds to `$PORT` automatically.

## Structure

```
web/
├─ app/
│  ├─ page.tsx              # Single-page marketing site
│  ├─ layout.tsx            # Root layout + metadata
│  ├─ globals.css           # Tailwind v4 + theme tokens
│  └─ api/subscribe/route.ts# POST -> Resend audience
├─ components/
│  ├─ Nav.tsx
│  ├─ Hero.tsx
│  ├─ HowItWorks.tsx
│  ├─ SampleSignals.tsx
│  ├─ Pricing.tsx
│  ├─ Footer.tsx
│  └─ SubscribeForm.tsx
├─ next.config.mjs           # output: standalone for smaller deploys
├─ nixpacks.toml             # Railway build config
└─ railway.json              # Railway deploy config
```
