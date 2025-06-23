import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/register/success",
  "/about",
  "/contact",
  "/features",
  "/benefits",
  "/testimonials",
  "/products",
  "/resources",
  "/company",
  "/not-found",
  "/error",
  "/api/auth",
  "/favicon.ico",
  "/_next",
  "/public",
]

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => {
    if (route === path) return true
    if (route.endsWith("*") && path.startsWith(route.slice(0, -1))) return true
    if (path.startsWith(route + "/")) return true
    return false
  })
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the current path
  const path = req.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (path.startsWith("/_next") || path.startsWith("/api") || path.includes(".") || path.startsWith("/favicon")) {
    return res
  }

  // Check if the path is public
  if (isPublicRoute(path)) {
    return res
  }

  try {
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

    // If user is authenticated and trying to access the root dashboard path, redirect to appropriate dashboard
    if (session && path === "/dashboard") {
      try {
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
      } catch (error) {
        console.error("Error fetching user profile:", error)
        // Continue with the request if profile fetch fails
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, allow the request to continue
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
