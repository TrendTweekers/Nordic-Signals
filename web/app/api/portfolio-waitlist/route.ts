import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; fund?: string; companies?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const fund = (body.fund || "").trim().slice(0, 120);
  const companies = Array.isArray(body.companies)
    ? body.companies.map((c) => String(c).trim()).filter(Boolean).slice(0, 200)
    : [];

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId =
    process.env.RESEND_PORTFOLIO_AUDIENCE_ID || process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.error("[portfolio-waitlist] missing RESEND env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  try {
    await resend.contacts.create({
      email,
      audienceId,
      firstName: fund || undefined,
      unsubscribed: false,
    });
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (!/already exists|duplicate/i.test(msg)) {
      console.error("[portfolio-waitlist] resend contact error", err);
      return NextResponse.json({ error: "Could not join waitlist" }, { status: 502 });
    }
  }

  // Notify ourselves with the portfolio details so we can act manually.
  const notifyTo = process.env.PORTFOLIO_NOTIFY_TO;
  const notifyFrom = process.env.DIGEST_FROM;
  if (notifyTo && notifyFrom) {
    try {
      await resend.emails.send({
        from: notifyFrom,
        to: [notifyTo],
        subject: `Portfolio waitlist signup — ${fund || email}`,
        text:
          `Email: ${email}\n` +
          `Fund: ${fund || "(none)"}\n\n` +
          `Companies (${companies.length}):\n` +
          (companies.length ? companies.map((c) => ` - ${c}`).join("\n") : "  (none provided)"),
      });
    } catch (err) {
      console.error("[portfolio-waitlist] notify email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
