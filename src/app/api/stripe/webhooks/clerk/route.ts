import { NextResponse } from "next/server";

// POST /api/stripe/webhooks/clerk
// Stub webhook handler.
export async function POST(req: Request) {
  // Read body so the request is fully consumed.
  await req.text().catch(() => "");

  return NextResponse.json({ received: true });
}

