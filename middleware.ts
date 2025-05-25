import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes
    const protectedPaths = ["/dashboard", "/orders", "/products", "/wholesalers", "/delivery-partner"]
    const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    // Redirect to login if accessing protected route without session
    if (isProtectedPath && !session) {
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth pages with session
    const authPaths = ["/login", "/register"]
    const isAuthPath = authPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    if (isAuthPath && session) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
