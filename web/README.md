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
3. Audiences → Create audience → "Nordic Signals subscribers". Copy its ID.
4. API Keys → create one with **Sending access**.
5. Set `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` as env vars locally and on Railway.

## Deploy on Railway

1. New project → Deploy from GitHub repo → pick `Nordic-Signals`.
2. Service settings → **Root directory: `web`**. (This is the only Railway-specific step — everything else is auto-detected via `nixpacks.toml`.)
3. Variables → add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`.
4. Networking → generate a Railway domain or attach a custom one (`nordicsignals.com`).

Railway will build with Nixpacks, run `npm run start`, and bind to `$PORT` automatically.

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
