import { NextResponse, type NextRequest } from "next/server"

/**
 * Safe middleware that:
 * - Uses ONLY server-side env vars (SUPABASE_URL, SUPABASE_ANON_KEY).
 * - Dynamically imports Supabase helper to avoid bundling on client.
 * - No-ops if envs are missing or any error occurs, so public pages always render.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Bypass common static assets and special routes
  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg")
  if (isAsset) return res

  // Use server-only env vars. Do NOT reference NEXT_PUBLIC_* here.
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  // If server envs are not present, skip auth refresh and continue.
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase server envs missing in middleware; skipping session refresh.")
    }
    return res
  }

  try {
    // Dynamically import to ensure it's only used server-side
    const { createMiddlewareClient } = await import("@supabase/auth-helpers-nextjs")
    const supabase = createMiddlewareClient({ req, res } as any, {
      supabaseUrl,
      supabaseKey,
    })

    // Touch the session to keep it fresh; ignore errors so public pages still load
    await supabase.auth.getSession().catch(() => {})
  } catch (error) {
    console.warn("Middleware: Supabase session refresh skipped.", (error as Error)?.message)
  }

  return res
}

// Apply to app routes but exclude common static endpoints
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots|sitemap|manifest|public).*)"],
}
