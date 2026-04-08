import { NextResponse } from "next/server";

// POST /api/stripe/webhooks/stripe
// Stub webhook handler.
export async function POST(req: Request) {
  await req.text().catch(() => "");

  return NextResponse.json({ received: true });
}

