import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { validatePayUConfig } from "@/lib/payu-client"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check PayU configuration
    try {
      validatePayUConfig()
      return NextResponse.json({
        success: true,
        message: "PayU configuration is valid",
        config: {
          merchantKeySet: !!process.env.PAYU_MERCHANT_KEY,
          merchantSaltSet: !!process.env.PAYU_MERCHANT_SALT,
          siteUrlSet: !!process.env.NEXT_PUBLIC_SITE_URL,
        },
      })
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error.message,
        config: {
          merchantKeySet: !!process.env.PAYU_MERCHANT_KEY,
          merchantSaltSet: !!process.env.PAYU_MERCHANT_SALT,
          siteUrlSet: !!process.env.NEXT_PUBLIC_SITE_URL,
        },
      })
    }
  } catch (error: any) {
    console.error("Error checking PayU config:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to check PayU configuration",
      },
      { status: 500 },
    )
  }
}
