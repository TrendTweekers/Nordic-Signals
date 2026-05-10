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
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.error("[subscribe] missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  try {
    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (!/already exists|duplicate/i.test(msg)) {
      console.error("[subscribe] resend error", err);
      return NextResponse.json({ error: "Could not subscribe" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
