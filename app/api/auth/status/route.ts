import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    return NextResponse.json({
      authenticated: true,
      userId: session.user.id,
      role: profile?.role || null,
    })
  } catch (error) {
    console.error("Auth status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
