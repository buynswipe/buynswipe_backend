import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({
        authenticated: false,
      })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      profile,
    })
  } catch (error) {
    console.error("Error checking auth status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
