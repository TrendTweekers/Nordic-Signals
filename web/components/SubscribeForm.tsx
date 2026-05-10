"use client";

import { useState } from "react";

export function SubscribeForm({ size = "md" }: { size?: "md" | "lg" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Something went wrong");
      setStatus("ok");
      setMessage("You're on the list. First digest hits Monday 08:00 CET.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong");
    }
  }

  const inputCls =
    size === "lg"
      ? "h-12 px-4 text-base"
      : "h-11 px-3 text-sm";
  const btnCls =
    size === "lg"
      ? "h-12 px-6 text-base"
      : "h-11 px-5 text-sm";

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className={`flex-1 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] ${inputCls}`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`rounded-md bg-[var(--color-accent)] text-[#0b1220] font-medium hover:bg-[var(--color-accent-glow)] transition-colors disabled:opacity-50 ${btnCls}`}
        >
          {status === "loading" ? "..." : "Get signals"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${
            status === "ok" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
      {!message && (
        <p className="mt-3 text-xs text-[var(--color-text-dim)]">
          Free weekly digest. Unsubscribe with one click.
        </p>
      )}
    </form>
  );
}
