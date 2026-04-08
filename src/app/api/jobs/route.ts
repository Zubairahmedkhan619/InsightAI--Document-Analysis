

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

const FREE_ALLOWED_TYPES = ["pdf", "word", "ppt"];

async function alertAdmin(subject: string, details: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey  = process.env.RESEND_API_KEY;
  if (!adminEmail || !resendKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    `InsightAI Alerts <alerts@${process.env.RESEND_DOMAIN || "yourdomain.com"}>`,
        to:      [adminEmail],
        subject: `🚨 InsightAI Alert: ${subject}`,
        html:    `<h2>${subject}</h2><pre style="background:#f4f4f4;padding:16px">${details}</pre><p>Time: ${new Date().toISOString()}</p>`,
      }),
    });
  } catch { /* never crash on alert failure */ }
}

async function ensureUserExists(userId: string) {
  const sb = createAdminClient();
  const { data: existing, error: checkErr } = await sb
    .from("users").select("id").eq("id", userId).single();

  if (checkErr && checkErr.code !== "PGRST116") {
    await alertAdmin("Database Error - users check failed", checkErr.message);
    throw new Error(checkErr.message);
  }

  if (!existing) {
    const clerkUser = await currentUser();
    const email     = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
    const full_name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

    await sb.from("users").upsert({ id: userId, email, full_name }, { onConflict: "id" });
    await sb.from("user_credits").upsert(
      { user_id: userId, credits_remaining: 2, plan: "free", total_analyses: 0 },
      { onConflict: "user_id" }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const sb = createAdminClient();
    const { data: jobs, error } = await sb
      .from("jobs").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(limit);

    if (error) {
      await alertAdmin("Database Error - jobs GET", `userId: ${userId}\n${error.message}`);
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ jobs: jobs || [] });
  } catch (err: any) {
    await alertAdmin("API Crash - GET /api/jobs", err?.message);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await ensureUserExists(userId);

    const body = await request.json();
    const sb   = createAdminClient();

    // Load credits
    const { data: credits, error: credErr } = await sb
      .from("user_credits").select("plan, credits_remaining, total_analyses")
      .eq("user_id", userId).single();

    if (credErr && credErr.code !== "PGRST116") {
      await alertAdmin("Database Error - credits load", `userId: ${userId}\n${credErr.message}`);
      return Response.json({ error: "Failed to load credits" }, { status: 500 });
    }

    const plan             = credits?.plan             ?? "free";
    const creditsRemaining = credits?.credits_remaining ?? 2;
    const isPro            = plan === "pro";
    const isAdmin          = credits?.is_admin ?? false;

    // Admin has full access
    if (isAdmin) {
      // Insert job without credit check
      const { data: job, error: jobErr } = await sb
        .from("jobs")
        .insert({ ...body, user_id: userId, is_paid_analysis: true, status: "pending" })
        .select().single();

      if (jobErr) {
        await alertAdmin("Database Error - job insert", `userId: ${userId}\n${jobErr.message}`);
        return Response.json({ error: jobErr.message }, { status: 500 });
      }

      // Trigger n8n
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        const { data: userData } = await sb.from("users").select("email").eq("id", userId).single();
        fetch(n8nUrl, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ ...job, user_email: userData?.email })
        });
      }

      return Response.json({ job, credits_remaining: creditsRemaining });
    }

    // Free tier: block unsupported input types
    if (!isPro && !FREE_ALLOWED_TYPES.includes(body.input_type)) {
      return Response.json(
        { error: `${body.input_type.toUpperCase()} requires Pro`, upgrade_url: "/#pricing", code: "UPGRADE_REQUIRED" },
        { status: 403 }
      );
    }

    // Free tier: block paid analysis types
    if (!isPro && ["sentiment", "statistical"].includes(body.analysis_type)) {
      return Response.json(
        { error: "This analysis type requires Pro", upgrade_url: "/#pricing", code: "UPGRADE_REQUIRED" },
        { status: 403 }
      );
    }

    // No credits left
    if (creditsRemaining <= 0) {
      return Response.json(
        { error: "No credits remaining this month", upgrade_url: "/#pricing", code: "NO_CREDITS" },
        { status: 402 }
      );
    }

    // Insert job
    const { data: job, error: jobErr } = await sb
      .from("jobs")
      .insert({ ...body, user_id: userId, is_paid_analysis: isPro, status: "pending" })
      .select().single();

    if (jobErr) {
      await alertAdmin("Database Error - job insert", `userId: ${userId}\n${jobErr.message}`);
      return Response.json({ error: jobErr.message }, { status: 500 });
    }

    // Trigger n8n
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      const { data: userData } = await sb.from("users").select("email").eq("id", userId).single();
      fetch(n8nUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...job, user_email: userData?.email || null }),
        signal:  AbortSignal.timeout(10000),
      }).catch(async (err) => {
        await alertAdmin("n8n Trigger Failed", `Job: ${job.id}\nURL: ${n8nUrl}\nError: ${err.message}`);
      });
    } else {
      await alertAdmin("n8n Not Configured", `N8N_WEBHOOK_URL missing. Job ${job.id} stuck at pending.`);
    }

    return Response.json({ job });

  } catch (err: any) {
    await alertAdmin("API Crash - POST /api/jobs", err?.message);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}