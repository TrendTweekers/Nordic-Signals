const signals = [
  {
    company: "Northvolt",
    flag: "🇸🇪",
    delta: "+3 roles",
    headline: "Battery ML Engineer (×3)",
    tag: "AI · Hardware",
    note: "First time hiring battery-specific ML — signal of model-driven manufacturing scaling.",
    accent: "ai",
  },
  {
    company: "Truecaller",
    flag: "🇸🇪",
    delta: "+1 role",
    headline: "Senior AI Platform Engineer",
    tag: "AI · Infra",
    note: "First dedicated AI platform role. Likely standing up internal model-serving infra.",
    accent: "ai",
  },
  {
    company: "Einride",
    flag: "🇸🇪",
    delta: "−4 roles",
    headline: "Autonomy team contracting",
    tag: "Closed",
    note: "Multiple Autonomy Engineer postings removed within 5 days. Possible re-org or freeze.",
    accent: "warn",
  },
  {
    company: "Lovable",
    flag: "🇸🇪",
    delta: "+2 roles",
    headline: "Staff ML Engineer · Inference",
    tag: "AI · Infra",
    note: "Adding senior infra capacity around inference — usage growth pressure.",
    accent: "ai",
  },
  {
    company: "Wolt",
    flag: "🇫🇮",
    delta: "+5 roles",
    headline: "Platform / Reliability cluster",
    tag: "Infra",
    note: "Five SRE & Platform roles posted same week. Infra investment phase.",
    accent: "infra",
  },
  {
    company: "Sana Labs",
    flag: "🇸🇪",
    delta: "+1 role",
    headline: "Head of Applied ML",
    tag: "AI · Leadership",
    note: "Senior ML leadership hire — typically precedes a product capability launch.",
    accent: "ai",
  },
];

const accentClasses: Record<string, string> = {
  ai: "border-cyan-500/40 bg-cyan-500/5",
  infra: "border-violet-500/40 bg-violet-500/5",
  warn: "border-amber-500/40 bg-amber-500/5",
};

const tagClasses: Record<string, string> = {
  ai: "text-cyan-300",
  infra: "text-violet-300",
  warn: "text-amber-300",
};

export function SampleSignals() {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/30">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
          Sample digest · Last 7 days
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight max-w-2xl">
          What a week of Nordic signals looks like.
        </h2>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-xl">
          Real format, illustrative data. The Monday email groups by company, flags AI &amp; infra signals, and surfaces closed roles too.
        </p>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((s) => (
            <div
              key={s.headline}
              className={`rounded-lg border p-5 ${accentClasses[s.accent]}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">
                  {s.flag} {s.company}
                </span>
                <span className={`font-mono ${tagClasses[s.accent]}`}>{s.delta}</span>
              </div>
              <h3 className="mt-3 text-base font-medium text-white leading-snug">
                {s.headline}
              </h3>
              <div className={`mt-2 text-xs uppercase tracking-wider ${tagClasses[s.accent]}`}>
                {s.tag}
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
