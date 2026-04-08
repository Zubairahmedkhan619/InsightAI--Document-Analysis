
import { createAdminClient } from "@/lib/supabase/server";

// PUBLIC endpoint — no auth check. Needed for shared analysis pages.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sb = createAdminClient();
  const { data: job, error } = await sb
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ job });
}