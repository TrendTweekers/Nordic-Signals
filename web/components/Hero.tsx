import { SubscribeForm } from "./SubscribeForm";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 glow pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 text-xs text-[var(--color-text-muted)] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          Tracking 40+ Nordic startups · Updated daily
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
          Weekly Nordic AI &amp;<br />
          engineering hiring signals.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
          Know which Nordic startups are scaling AI infra, hiring Staff ML engineers, or quietly slowing down — before your competitors do.
        </p>
        <div className="mt-10 flex justify-center">
          <SubscribeForm size="lg" />
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[var(--color-text-dim)]">
          <span>Klarna</span>
          <span>Northvolt</span>
          <span>Truecaller</span>
          <span>Pleo</span>
          <span>Einride</span>
          <span>Wolt</span>
          <span>Sana Labs</span>
          <span>Lovable</span>
          <span>Polestar</span>
          <span>+30 more</span>
        </div>
      </div>
    </section>
  );
}
