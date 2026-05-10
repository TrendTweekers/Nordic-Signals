import { SubscribeForm } from "./SubscribeForm";

const tiers = [
  {
    name: "Free",
    price: "€0",
    cadence: "Forever",
    blurb: "The Monday digest, in your inbox.",
    features: [
      "Weekly Monday email digest",
      "All Nordic AI / infra signals",
      "Closed-roles section",
      "Unsubscribe any time",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "€299",
    cadence: "/ month",
    blurb: "For recruiters &amp; sales teams who act on the data.",
    features: [
      "Everything in Free",
      "Daily alerts (not just Monday)",
      "Filter by country, seniority, tech",
      "CSV / Notion exports",
      "Slack delivery",
      "Company hiring-velocity charts",
    ],
    cta: "Coming soon",
    highlight: true,
  },
  {
    name: "Team / API",
    price: "€999+",
    cadence: "/ month",
    blurb: "For dev tool sales teams & VCs.",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "API access",
      "Custom company watchlists",
      "Quarterly market report",
      "Dedicated Slack support",
    ],
    cta: "Talk to me",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
          Pricing
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight max-w-2xl">
          Start free. Upgrade when the signals make you money.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-xl border p-7 flex flex-col ${
                t.highlight
                  ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/[0.04]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40"
              }`}
            >
              <div className="text-sm text-[var(--color-text-muted)]">{t.name}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="text-4xl font-semibold text-white">{t.price}</div>
                <div className="text-sm text-[var(--color-text-dim)]">{t.cadence}</div>
              </div>
              <p
                className="mt-3 text-sm text-[var(--color-text-muted)]"
                dangerouslySetInnerHTML={{ __html: t.blurb }}
              />
              <ul className="mt-6 space-y-2.5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--color-accent)] mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {t.name === "Free" ? (
                  <SubscribeForm />
                ) : (
                  <button
                    className={`w-full h-11 rounded-md text-sm font-medium ${
                      t.highlight
                        ? "bg-[var(--color-accent)] text-[#0b1220] hover:bg-[var(--color-accent-glow)]"
                        : "bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                    } transition-colors`}
                  >
                    {t.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
