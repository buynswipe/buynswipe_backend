import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, approve } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update user approval status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_approved: approve,
      })
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update user approval status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
