const tiers = [
  {
    name: "Free",
    price: "€0",
    cadence: "forever",
    blurb: "The Monday digest, in your inbox.",
    features: [
      "Weekly Monday email",
      "All Nordic AI / infra signals",
      "Closed-roles section",
      "Unsubscribe any time",
    ],
    cta: { label: "Get the digest", href: "#top", variant: "outline" as const },
    highlight: false,
  },
  {
    name: "Pro",
    price: "€299",
    cadence: "/ month",
    blurb: "For recruiters & sales teams who act on the data.",
    features: [
      "Everything in Free",
      "Daily alerts",
      "Filter by country, seniority, tech",
      "CSV / Notion exports",
      "Slack delivery",
      "Company hiring-velocity charts",
    ],
    cta: { label: "Coming soon", href: null, variant: "disabled" as const },
    highlight: false,
  },
  {
    name: "Portfolio",
    price: "€799",
    cadence: "/ month",
    blurb: "For VCs and angel syndicates tracking their own companies.",
    features: [
      "Everything in Pro",
      "Unlimited Portfolio Monitor",
      "Private portfolio dashboard",
      "Portfolio-wide insights & scoring",
      "Competitor tracking",
      "Priority support",
    ],
    cta: { label: "Join beta", href: "#portfolio", variant: "primary" as const },
    highlight: true,
    badge: "Private Beta",
  },
  {
    name: "Team",
    price: "€1,499+",
    cadence: "/ month",
    blurb: "Larger funds, agencies, and dev tool sales orgs.",
    features: [
      "Everything in Portfolio",
      "Multiple seats",
      "API access",
      "White-label reports",
      "Dedicated account manager",
    ],
    cta: {
      label: "Talk to me",
      href: "mailto:hello@nordicsignals.com?subject=Team%20enquiry",
      variant: "outline" as const,
    },
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight max-w-2xl">
            Start free. Upgrade when the signals make you money.
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs md:text-right">
            First 20 Portfolio customers lock <span className="text-white">€599/mo</span> for 6 months.
          </p>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-xl border p-6 flex flex-col ${
                t.highlight
                  ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/[0.04]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40"
              }`}
            >
              {t.badge && (
                <div className="absolute -top-3 left-6 px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-[10px] uppercase tracking-wider font-medium text-[#0b1220]">
                  {t.badge}
                </div>
              )}
              <div className="text-sm font-medium text-white">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1.5 whitespace-nowrap">
                <div className="text-3xl font-semibold text-white">{t.price}</div>
                <div className="text-xs text-[var(--color-text-dim)]">{t.cadence}</div>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed min-h-[3.5rem]">
                {t.blurb}
              </p>
              <ul className="mt-5 space-y-2 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--color-accent)] mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PricingCta cta={t.cta} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCta({
  cta,
}: {
  cta: { label: string; href: string | null; variant: "primary" | "outline" | "disabled" };
}) {
  const base = "block w-full text-center h-11 leading-[44px] rounded-md text-sm font-medium transition-colors";
  if (cta.variant === "disabled") {
    return (
      <button
        disabled
        className={`${base} bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed`}
      >
        {cta.label}
      </button>
    );
  }
  const cls =
    cta.variant === "primary"
      ? "bg-[var(--color-accent)] text-[#0b1220] hover:bg-[var(--color-accent-glow)]"
      : "bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]";
  return (
    <a href={cta.href!} className={`${base} ${cls}`}>
      {cta.label}
    </a>
  );
}
