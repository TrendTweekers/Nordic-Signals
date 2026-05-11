import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] missing RESEND_API_KEY");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const resend = new Resend(apiKey);

  // 1) Optionally push to a Resend audience if configured. Non-blocking — if it
  //    fails (or no audience is set) we still want the signup to succeed.
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (audienceId) {
    try {
      await resend.contacts.create({ email, audienceId, unsubscribed: false });
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (!/already exists|duplicate/i.test(msg)) {
        console.warn("[subscribe] audience push failed (continuing)", msg);
      }
    }
  }

  // 2) Notify founder. This is the primary mechanism in the validation phase —
  //    every signup hits your inbox so you know immediately.
  const notifyTo = process.env.NOTIFY_TO;
  const notifyFrom = process.env.DIGEST_FROM;
  if (notifyTo && notifyFrom) {
    try {
      await resend.emails.send({
        from: notifyFrom,
        to: [notifyTo],
        subject: `New Nordic Signals subscriber: ${email}`,
        text: `New free-tier subscriber:\n\n  ${email}\n\nSent at: ${new Date().toISOString()}`,
      });
    } catch (err) {
      console.warn("[subscribe] notify email failed (continuing)", err);
    }
  }

  return NextResponse.json({ ok: true });
}
