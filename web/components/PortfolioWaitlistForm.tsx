"use client";

import { useState } from "react";

export function PortfolioWaitlistForm() {
  const [email, setEmail] = useState("");
  const [fund, setFund] = useState("");
  const [companies, setCompanies] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const r = await fetch("/api/portfolio-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fund,
          companies: companies
            .split(/\r?\n|,/)
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Something went wrong");
      setStatus("ok");
      setMessage("You're in. We'll reach out within 48h with next steps.");
      setEmail("");
      setFund("");
      setCompanies("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="email"
          required
          placeholder="you@fund.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="h-11 px-3 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <input
          type="text"
          placeholder="Fund / firm (optional)"
          value={fund}
          onChange={(e) => setFund(e.target.value)}
          disabled={status === "loading"}
          className="h-11 px-3 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>
      <textarea
        placeholder="Portfolio companies — one per line (optional, you can send later)"
        value={companies}
        onChange={(e) => setCompanies(e.target.value)}
        disabled={status === "loading"}
        rows={4}
        className="w-full px-3 py-2.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] resize-y"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-11 px-6 rounded-md bg-[var(--color-accent)] text-[#0b1220] font-medium hover:bg-[var(--color-accent-glow)] transition-colors disabled:opacity-50 text-sm"
      >
        {status === "loading" ? "Joining..." : "Join private beta"}
      </button>
      {message && (
        <p className={`text-sm ${status === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
      {!message && (
        <p className="text-xs text-[var(--color-text-dim)]">
          Private beta. Limited to 20 funds. No charge during beta.
        </p>
      )}
    </form>
  );
}
