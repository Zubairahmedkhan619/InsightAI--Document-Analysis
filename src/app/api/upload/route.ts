import { NextResponse } from "next/server";

// POST /api/upload
// Stub: returns placeholder URLs (replace with Cloudflare R2 pre-signed URL).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json({
    uploadUrl: "",
    fileUrl: "",
    filename: body?.filename ?? null,
  });
}

