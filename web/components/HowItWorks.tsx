const steps = [
  {
    n: "01",
    title: "Scan",
    body: "We crawl 40+ Nordic startup career pages every morning at 06:00 UTC — Greenhouse, Lever, Ashby. Public data only.",
  },
  {
    n: "02",
    title: "Diff",
    body: "Today's snapshot is compared to yesterday's. New roles, removed roles, modified titles — the actual changes, not the noise.",
  },
  {
    n: "03",
    title: "Classify",
    body: "Each new role is tagged: department, seniority, AI capability signal, infra signal. Built on GPT-4o-mini.",
  },
  {
    n: "04",
    title: "Digest",
    body: "Every Monday at 08:00 CET you get a clean email: what shipped, what closed, which companies are accelerating.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
          How it works
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight max-w-2xl">
          A data pipeline. Not another newsletter.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-x-12 gap-y-10">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="text-sm font-mono text-[var(--color-accent)] mt-1">{s.n}</div>
              <div>
                <h3 className="text-lg font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-[var(--color-text-muted)] leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
