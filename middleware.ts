import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { isPublicRoute } from "./lib/public-routes"
import { debugAuthRequest } from "./lib/debug-auth"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Debug auth information if needed
  debugAuthRequest(req)

  // Get the current path
  const path = req.nextUrl.pathname

  // Check if the path is public
  if (isPublicRoute(path)) {
    return res
  }

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicRoute(path)) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access the root path, redirect to appropriate dashboard
  if (session && path === "/dashboard") {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile) {
      if (profile.role === "delivery_partner") {
        return NextResponse.redirect(new URL("/delivery-partner/dashboard", req.url))
      } else if (profile.role === "wholesaler") {
        return NextResponse.redirect(new URL("/wholesaler-dashboard", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard/main", req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
