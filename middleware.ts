import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/about",
      "/contact",
      "/features",
      "/benefits",
      "/testimonials",
      "/company",
      "/products",
      "/resources",
      "/register/success",
      "/pending-approval",
    ]

    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

    // If no session and trying to access protected route
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If has session and trying to access auth pages
    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
