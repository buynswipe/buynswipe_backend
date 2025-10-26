import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { getAIBandhuConfig } from "@/lib/ai-bandhu/role-config"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if user is approved
    if (!profile.is_approved) {
      return NextResponse.json({ error: "User not approved" }, { status: 403 })
    }

    // Get role configuration
    const config = getAIBandhuConfig(profile.role)

    if (!config) {
      return NextResponse.json({ error: "Role not supported for AI Bandhu" }, { status: 403 })
    }

    return NextResponse.json({
      hasAccess: true,
      role: profile.role,
      dashboardPath: config.dashboardPath,
      features: config.features,
    })
  } catch (error) {
    console.error("Access check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
