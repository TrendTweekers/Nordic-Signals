const signals = [
  {
    company: "Neko Health",
    flag: "🇸🇪",
    delta: "first-ai-capability",
    headline: "Data Science Lead",
    tag: "AI · Leadership",
    note: "First dedicated data-science leadership hire — likely standing up in-house ML capability.",
    accent: "ai",
  },
  {
    company: "Futurice",
    flag: "🇫🇮",
    delta: "ai-infra-scaleup",
    headline: "Principal AI Architect",
    tag: "AI · Infra",
    note: "Principal-level AI architecture role — capability build, not just consulting throughput.",
    accent: "ai",
  },
  {
    company: "Endra",
    flag: "🇸🇪",
    delta: "fundraise-prep",
    headline: "Finance Lead",
    tag: "Strategic · Finance",
    note: "Senior finance hire at an early-stage startup — fundraise or runway-extension prep.",
    accent: "warn",
  },
  {
    company: "Polestar",
    flag: "🇸🇪",
    delta: "compliance-buildout",
    headline: "Head of Cybersecurity",
    tag: "Security · Leadership",
    note: "Director-level security hire — typically precedes a regulated-market push or scale milestone.",
    accent: "warn",
  },
  {
    company: "ICEYE",
    flag: "🇫🇮",
    delta: "hardware-bet",
    headline: "Senior C++ · Satellite Real-Time Control",
    tag: "Hardware · Infra",
    note: "Specialised satellite-control engineering — physical product investment, not just SaaS.",
    accent: "infra",
  },
  {
    company: "Trustly",
    flag: "🇸🇪",
    delta: "leadership-upgrade",
    headline: "Engineering Director",
    tag: "Engineering · Leadership",
    note: "Director-level engineering hire at a payments scale-up — capability rebuild signal.",
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
