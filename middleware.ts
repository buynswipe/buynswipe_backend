import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get the requested path
    const path = req.nextUrl.pathname

    // Public paths that don't require authentication
    const publicPaths = ["/login", "/register", "/register-driver", "/pending-approval", "/payment-error"]

    // Check if the current path is public
    const isPublicPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))

    // API routes should pass through
    if (path.startsWith("/api/")) {
      return res
    }

    // Static assets should pass through
    if (path.startsWith("/_next/") || path.startsWith("/favicon.ico")) {
      return res
    }

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access protected route, redirect to login
    if (!session && !isPublicPath) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated, proceed with role-based checks
    if (session) {
      // Get user profile to check role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", session.user.id)
        .maybeSingle()

      // If profile fetch error, allow the request to proceed
      // The layout will handle this error appropriately
      if (error) {
        console.error("Middleware profile fetch error:", error)
        return res
      }

      // If no profile or not approved, redirect to pending approval
      // unless already on a public path
      if ((!profile || !profile.is_approved) && !isPublicPath) {
        const redirectUrl = new URL("/pending-approval", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, proceed with the request
    // The error will be handled by the error boundary
    return res
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
