export function Nav() {
  const links = [
    { href: "/#how", label: "How it works" },
    { href: "/#signals", label: "Sample digest" },
    { href: "/#portfolio", label: "Portfolio", badge: "Beta" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className="border-b border-[var(--color-border)]/60 backdrop-blur-md bg-[var(--color-bg)]/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
            <span className="text-sm font-medium tracking-tight text-white">Nordic Signals</span>
          </a>
          <div className="hidden md:flex items-center gap-7 text-sm text-[var(--color-text-muted)]">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white">
                {l.label}
                {l.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 text-[10px] tracking-wider text-[var(--color-accent)]">
                    {l.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
          <a
            href="#subscribe"
            className="text-xs sm:text-sm h-9 px-3 sm:px-4 rounded-md bg-[var(--color-accent)] text-[#0b1220] font-medium hover:bg-[var(--color-accent-glow)] transition-colors flex items-center whitespace-nowrap"
          >
            Get the digest
          </a>
        </div>
        {/* Mobile-only sub-row of section links */}
        <div className="md:hidden flex items-center gap-4 overflow-x-auto pb-2 text-xs text-[var(--color-text-muted)] -mx-1 px-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white whitespace-nowrap shrink-0">
              {l.label}
              {l.badge && (
                <span className="ml-1 px-1 py-0.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40 text-[9px] tracking-wider text-[var(--color-accent)]">
                  {l.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
