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
  if (!apiKey) {
    console.error("[portfolio-waitlist] missing RESEND_API_KEY");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const resend = new Resend(apiKey);

  // 1) Optionally push to a Resend audience. Falls back to the general audience
  //    if a portfolio-specific one isn't set. Non-blocking.
  const audienceId =
    process.env.RESEND_PORTFOLIO_AUDIENCE_ID || process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
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
        console.warn("[portfolio-waitlist] audience push failed (continuing)", msg);
      }
    }
  }

  // 2) Always notify the founder with the full portfolio list — this is the
  //    high-value "manual deep-dive" workflow during private beta.
  const notifyTo = process.env.PORTFOLIO_NOTIFY_TO || process.env.NOTIFY_TO;
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
          (companies.length
            ? companies.map((c) => ` - ${c}`).join("\n")
            : "  (none provided)") +
          `\n\nSent at: ${new Date().toISOString()}`,
      });
    } catch (err) {
      console.warn("[portfolio-waitlist] notify email failed (continuing)", err);
    }
  }

  return NextResponse.json({ ok: true });
}
