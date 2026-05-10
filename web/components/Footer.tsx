export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text)]">Nordic Signals</span>
          <span className="text-xs text-[var(--color-text-dim)]">
            · Public hiring data · GDPR-friendly
          </span>
        </div>
        <div className="flex gap-6 text-sm text-[var(--color-text-muted)]">
          <a href="mailto:hello@nordicsignals.com" className="hover:text-white">
            Contact
          </a>
          <a
            href="https://github.com/TrendTweekers/Nordic-Signals"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
