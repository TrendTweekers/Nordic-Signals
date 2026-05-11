export function Nav() {
  return (
    <nav className="border-b border-[var(--color-border)]/60 backdrop-blur-md bg-[var(--color-bg)]/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
          <span className="text-sm font-medium tracking-tight text-white">Nordic Signals</span>
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm text-[var(--color-text-muted)]">
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#signals" className="hover:text-white">Sample digest</a>
          <a href="#portfolio" className="hover:text-white">
            Portfolio Monitor
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 text-[10px] tracking-wider text-[var(--color-accent)]">
              Beta
            </span>
          </a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </div>
        <a
          href="#subscribe"
          className="text-sm h-9 px-4 rounded-md bg-[var(--color-accent)] text-[#0b1220] font-medium hover:bg-[var(--color-accent-glow)] transition-colors flex items-center"
        >
          Get the digest
        </a>
      </div>
    </nav>
  );
}
