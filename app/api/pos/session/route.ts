import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, session_data } = body

    if (action === "start") {
      // Start new POS session
      const { data: posSession, error } = await supabase
        .from("pos_sessions")
        .insert({
          user_id: session.user.id,
          started_at: new Date().toISOString(),
          status: "active",
          opening_cash: session_data?.opening_cash || 0,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Failed to start POS session" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        session: posSession,
        message: "POS session started successfully",
      })
    }

    if (action === "end") {
      // End current POS session
      const { session_id, closing_cash, notes } = session_data

      const { data: posSession, error } = await supabase
        .from("pos_sessions")
        .update({
          ended_at: new Date().toISOString(),
          status: "closed",
          closing_cash,
          notes,
        })
        .eq("id", session_id)
        .eq("user_id", session.user.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Failed to end POS session" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        session: posSession,
        message: "POS session ended successfully",
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current active session
    const { data: posSession, error } = await supabase
      .from("pos_sessions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: "Failed to fetch POS session" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session: posSession,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
