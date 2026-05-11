import { PortfolioWaitlistForm } from "./PortfolioWaitlistForm";

const sampleSignals = [
  {
    type: "accel",
    company: "Sana Labs",
    headline: "First-ever Head of AI role",
    detail: "Strategic foundational-model push. First leadership hire in this domain in 18 months.",
  },
  {
    type: "accel",
    company: "Lovable",
    headline: "5 Platform / SRE roles in one week",
    detail: "Infra investment phase. Cluster hire pattern usually precedes a product step-change.",
  },
  {
    type: "strategic",
    company: "Truecaller",
    headline: "First dedicated AI Platform Engineer",
    detail: "Internal inference infra ramp-up. Late-stage capability signal.",
  },
  {
    type: "risk",
    company: "Einride",
    headline: "4 Autonomy roles removed in 5 days",
    detail: "Cluster removal — possible re-org, freeze, or pivot. Worth a direct check-in.",
  },
  {
    type: "risk",
    company: "Northvolt",
    headline: "ML hiring velocity −60% MoM",
    detail: "Sharpest deceleration in 12 months. Pattern often precedes external news.",
  },
  {
    type: "strategic",
    company: "Portfolio Co X",
    headline: "First CFO posted",
    detail: "Classic late-stage prep signal — fundraise, secondary, or IPO orientation.",
  },
];

const accentCls: Record<string, string> = {
  accel: "border-emerald-500/40 bg-emerald-500/[0.04]",
  strategic: "border-amber-500/40 bg-amber-500/[0.04]",
  risk: "border-red-500/40 bg-red-500/[0.04]",
};

const tagCls: Record<string, string> = {
  accel: "text-emerald-300",
  strategic: "text-amber-300",
  risk: "text-red-300",
};

const tagLabel: Record<string, string> = {
  accel: "Acceleration",
  strategic: "Strategic move",
  risk: "Risk signal",
};

export function PortfolioMonitor() {
  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
          <span>Portfolio Monitor</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 text-[10px] tracking-wider text-[var(--color-accent)]">
            Private Beta
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight max-w-3xl">
          Know what your portfolio is doing — before they tell you.
        </h2>
        <p className="mt-5 text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
          Drop in your companies. We track them daily alongside the broader Nordic market and surface the signals that matter to investors: first-time strategic hires, sudden contractions, velocity inflections, and competitive talent flow.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-4 mb-12">
          <FeatureCard
            label="Acceleration"
            title="Catch the breakout"
            body="First-ever AI infra roles, sudden cluster hires, leadership upgrades. The earliest publicly visible signal a company is shifting gear."
          />
          <FeatureCard
            label="Risk"
            title="See the slowdown"
            body="Closed-role clusters, ghost teams, hiring velocity collapse. Often weeks ahead of any external announcement."
          />
          <FeatureCard
            label="Context"
            title="Compare against the market"
            body="Velocity vs the broader Nordic sector. Competitor poaching alerts. 'Your company X is hiring ML infra 3× faster than Y.'"
          />
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4">
            Sample portfolio feed · last 7 days
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sampleSignals.map((s) => (
              <div key={s.headline} className={`rounded-lg border p-4 ${accentCls[s.type]}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">{s.company}</span>
                  <span className={tagCls[s.type]}>{tagLabel[s.type]}</span>
                </div>
                <h3 className="mt-2 text-sm font-medium text-white leading-snug">
                  {s.headline}
                </h3>
                <p className="mt-2 text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            <h3 className="text-xl font-semibold text-white">Join the private beta</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-text-muted)]">
              <li className="flex gap-2.5">
                <span className="text-[var(--color-accent)] mt-0.5">✓</span>
                Personalized weekly digest covering your portfolio + the broader market
              </li>
              <li className="flex gap-2.5">
                <span className="text-[var(--color-accent)] mt-0.5">✓</span>
                Manual deep-dive insights from us in the first 4–6 weeks
              </li>
              <li className="flex gap-2.5">
                <span className="text-[var(--color-accent)] mt-0.5">✓</span>
                Direct input on which signals get prioritized in the product
              </li>
              <li className="flex gap-2.5">
                <span className="text-[var(--color-accent)] mt-0.5">✓</span>
                Founding-customer pricing locked when we launch GA
              </li>
            </ul>
          </div>
          <div className="md:min-w-[28rem]">
            <PortfolioWaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/40 p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2">
        {label}
      </div>
      <h3 className="text-base font-medium text-white">{title}</h3>
      <p className="mt-2.5 text-sm text-[var(--color-text-muted)] leading-relaxed">{body}</p>
    </div>
  );
}
