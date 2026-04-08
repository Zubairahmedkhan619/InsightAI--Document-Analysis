// import { createClient } from "@/lib/supabase/middleware";
// import { type NextRequest, NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
//   const { supabase, supabaseResponse } = createClient(request);

//   // Refresh session if expired
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   return supabaseResponse;
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};