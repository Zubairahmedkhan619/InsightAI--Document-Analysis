// // import { auth } from "@clerk/nextjs/server";
// // import { createAdminClient } from "@/lib/supabase/server";

// // export async function GET() {
// //   const { userId } = await auth();
// //   if (!userId) {
// //     return new Response(JSON.stringify({ error: "Unauthorized" }), {
// //       status: 401,
// //       headers: { "Content-Type": "application/json" },
// //     });
// //   }

// //   const sb = createAdminClient();

// //   const { data: existingUser, error: userError } = await sb
// //     .from("users")
// //     .select("id")
// //     .eq("id", userId)
// //     .single();

// //   if (userError && userError.code !== "PGRST116") {
// //     return new Response(JSON.stringify({ error: userError.message }), {
// //       status: 500,
// //       headers: { "Content-Type": "application/json" },
// //     });
// //   }

// //   if (!existingUser) {
// //     const { error: createUserError } = await sb
// //       .from("users")
// //       .insert({ id: userId });

// //     if (createUserError) {
// //       return new Response(JSON.stringify({ error: createUserError.message }), {
// //         status: 500,
// //         headers: { "Content-Type": "application/json" },
// //       });
// //     }

// //     // Insert user_credits row for new user
// //     const { error: createCreditsError } = await sb
// //       .from("user_credits")
// //       .insert({ user_id: userId });

// //     if (createCreditsError) {
// //       return new Response(JSON.stringify({ error: createCreditsError.message }), {
// //         status: 500,
// //         headers: { "Content-Type": "application/json" },
// //       });
// //     }
// //   }

// //   const { data: credits, error } = await sb
// //     .from("user_credits")
// //     .select("plan, credits_remaining")
// //     .eq("user_id", userId)
// //     .single();

// //   if (error && error.code !== "PGRST116") {
// //     // PGRST116 = no rows found in single select; fallback to defaults
// //     return new Response(JSON.stringify({ error: error.message }), {
// //       status: 500,
// //       headers: { "Content-Type": "application/json" },
// //     });
// //   }

// //   if (!credits) {
// //     const defaultCredits = { plan: "free", credits_remaining: 2 };
// //     return new Response(JSON.stringify({ credits: defaultCredits }), {
// //       status: 200,
// //       headers: { "Content-Type": "application/json" },
// //     });
// //   }

// //   return new Response(JSON.stringify({ credits }), {
// //     status: 200,
// //     headers: { "Content-Type": "application/json" },
// //   });
// // }

// import { auth } from "@clerk/nextjs/server";
// import { createAdminClient } from "@/lib/supabase/server";

// export async function GET() {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return new Response(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     console.log("credits route - userId:", userId);

//     const sb = createAdminClient();

//     // Check user exists
//     const { data: existingUser, error: userError } = await sb
//       .from("users")
//       .select("id")
//       .eq("id", userId)
//       .single();

//     console.log("existingUser:", existingUser, "userError:", userError?.code, userError?.message);

//     if (userError && userError.code !== "PGRST116") {
//       return new Response(JSON.stringify({ error: userError.message }), {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     if (!existingUser) {
//       console.log("Creating user row...");
//       const { error: createUserError } = await sb
//         .from("users")
//         .insert({ id: userId });
//       console.log("createUserError:", createUserError?.message);

//       console.log("Creating credits row...");
//       const { error: createCreditsError } = await sb
//         .from("user_credits")
//         .insert({ user_id: userId });
//       console.log("createCreditsError:", createCreditsError?.message);
//     }

//     const { data: credits, error: creditsError } = await sb
//       .from("user_credits")
//       .select("plan, credits_remaining")
//       .eq("user_id", userId)
//       .single();

//     console.log("credits:", credits, "creditsError:", creditsError?.code, creditsError?.message);

//     if (creditsError && creditsError.code !== "PGRST116") {
//       return new Response(JSON.stringify({ error: creditsError.message }), {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     return new Response(
//       JSON.stringify({
//         credits: credits ?? { plan: "free", credits_remaining: 2 },
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );

//   } catch (err: any) {
//     console.error("CREDITS ROUTE CRASH:", err?.message, err?.stack);
//     return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }


import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

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

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sb = createAdminClient();

    // Check if user row exists — auto-provision if not
    const { data: existing, error: checkErr } = await sb
      .from("users").select("id").eq("id", userId).single();

    if (checkErr && checkErr.code !== "PGRST116") {
      await alertAdmin("Database Error - users check in credits", checkErr.message);
      return Response.json({ error: checkErr.message }, { status: 500 });
    }

    if (!existing) {
      const clerkUser = await currentUser();
      const email     = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
      const full_name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

      await sb.from("users").upsert({ id: userId, email, full_name }, { onConflict: "id" });
      await sb.from("user_credits").upsert(
        { user_id: userId, credits_remaining: 2, plan: "free", total_analyses: 0, is_admin: false },
        { onConflict: "user_id" }
      );
    }

    // Fetch credits
    const { data: credits, error } = await sb
      .from("user_credits")
      .select("plan, credits_remaining, total_analyses, subscription_expires, is_admin")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      await alertAdmin("Database Error - credits fetch", `userId: ${userId}\n${error.message}`);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      credits: credits ?? { plan: "free", credits_remaining: 2, total_analyses: 0, is_admin: false },
    });

  } catch (err: any) {
    await alertAdmin("API Crash - GET /api/credits", err?.message);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}