import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if the path is /products and the user is authenticated
  if (request.nextUrl.pathname === "/products") {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to manage-products
    if (session) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (profile && ["admin", "retailer", "wholesaler"].includes(profile.role)) {
        return NextResponse.redirect(new URL("/manage-products", request.url))
      }
    }
  }

  return res
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/products", "/products/:path*"],
}
