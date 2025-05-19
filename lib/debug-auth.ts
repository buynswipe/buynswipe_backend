import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { isPublicRoute } from "./public-routes"

/**
 * Debug authentication and routing issues
 * This function logs information about the request, session, and routing decisions
 */
export async function debugAuthRequest(req: NextRequest): Promise<void> {
  // Only run in development or when debugging is enabled
  if (process.env.NODE_ENV !== "development" && process.env.DEBUG_AUTH !== "true") {
    return
  }

  try {
    const path = req.nextUrl.pathname
    const cookies = req.cookies.getAll()
    const authCookie = cookies.find((c) => c.name.includes("supabase.auth"))

    console.log(`[Auth Debug] Request path: ${path}`)
    console.log(`[Auth Debug] Is public route: ${isPublicRoute(path)}`)
    console.log(`[Auth Debug] Request to: ${path}`)
    console.log(`[Auth Debug] Has auth cookie: ${!!authCookie}`)

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data } = await supabase.auth.getSession()

    console.log(`[Auth Debug] Has session: ${!!data.session}`)
    if (data.session) {
      console.log(`[Auth Debug] User ID: ${data.session.user.id}`)

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", data.session.user.id)
        .maybeSingle()

      console.log(`[Auth Debug] User role: ${profile?.role || "unknown"}`)
      console.log(`[Auth Debug] User approved: ${profile?.is_approved || false}`)
    }
  } catch (error) {
    console.error("[Auth Debug] Error:", error)
  }
}

// For backward compatibility, also export the function with the original name
export { debugAuthRequest as debugAuth }
