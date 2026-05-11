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

## Resend setup (one-time)

1. Sign up at [resend.com](https://resend.com).
2. Add and verify a sending domain (e.g. `nordicsignals.com`). For testing you can use `onboarding@resend.dev` as the sender.
3. Audiences → create **two**:
   - "Nordic Signals — general" → `RESEND_AUDIENCE_ID`
   - "Nordic Signals — portfolio beta" → `RESEND_PORTFOLIO_AUDIENCE_ID`
4. API Keys → create one with **Sending access** → `RESEND_API_KEY`.
5. (Optional, recommended) set `DIGEST_FROM` (verified sender) + `PORTFOLIO_NOTIFY_TO` (your inbox) so portfolio waitlist signups also notify you with the company list.

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
