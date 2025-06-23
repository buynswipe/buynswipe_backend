import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "retailer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { opening_cash } = await request.json()

    // Check if there's already an active session
    const { data: activeSession } = await supabase
      .from("pos_sessions")
      .select("*")
      .eq("retailer_id", session.user.id)
      .eq("status", "active")
      .single()

    if (activeSession) {
      return NextResponse.json({ error: "Active session already exists" }, { status: 400 })
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from("pos_sessions")
      .insert({
        retailer_id: session.user.id,
        opening_cash: opening_cash || 0,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: newSession })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "retailer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get current active session
    const { data: activeSession } = await supabase
      .from("pos_sessions")
      .select("*")
      .eq("retailer_id", session.user.id)
      .eq("status", "active")
      .single()

    return NextResponse.json({ success: true, session: activeSession })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { session_id, closing_cash } = await request.json()

    // Close the session
    const { data: closedSession, error } = await supabase
      .from("pos_sessions")
      .update({
        status: "closed",
        session_end: new Date().toISOString(),
        closing_cash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .eq("retailer_id", session.user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to close session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: closedSession })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
