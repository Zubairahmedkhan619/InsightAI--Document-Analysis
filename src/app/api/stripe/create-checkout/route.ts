import { NextResponse } from "next/server";

// POST /api/stripe/create-checkout
// Stub: return placeholder checkout URL.
export async function POST(req: Request) {
  const _body = await req.json().catch(() => ({}));

  return NextResponse.json({
    url: "/",
  });
}

