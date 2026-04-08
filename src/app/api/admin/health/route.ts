import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/health — ping from UptimeRobot or n8n monitoring cron
export async function GET() {
  const checks: Record<string, boolean | string> = {};

  // 1. Supabase
  try {
    const sb = createAdminClient();
    const { error } = await sb.from("users").select("id").limit(1);
    checks.supabase = error ? `ERROR: ${error.message}` : true;
  } catch (e: any) {
    checks.supabase = `CRASH: ${e?.message}`;
  }

  // 2. n8n reachable
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      const base = new URL(n8nUrl).origin;
      const res = await fetch(base, { signal: AbortSignal.timeout(3000) });
      checks.n8n = res.ok || res.status < 500 ? true : `HTTP ${res.status}`;
    } else {
      checks.n8n = "NOT_CONFIGURED";
    }
  } catch (e: any) {
    checks.n8n = `UNREACHABLE: ${e?.message}`;
  }

  // 3. Groq API
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: AbortSignal.timeout(3000),
    });
    checks.groq = res.ok ? true : `HTTP ${res.status}`;
  } catch (e: any) {
    checks.groq = `UNREACHABLE: ${e?.message}`;
  }

  const allHealthy = Object.values(checks).every((v) => v === true);

  // Alert admin if anything is down
  if (!allHealthy) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;
    if (adminEmail && resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `InsightAI Alerts <alerts@${process.env.RESEND_DOMAIN || "yourdomain.com"}>`,
          to: [adminEmail],
          subject: "🚨 InsightAI Health Check Failed",
          html: `<h2>System Health Alert</h2><pre>${JSON.stringify(checks, null, 2)}</pre><p>${new Date().toISOString()}</p>`,
        }),
      }).catch(() => {});
    }
  }

  return Response.json(
    {
      status: allHealthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 },
  );
}
