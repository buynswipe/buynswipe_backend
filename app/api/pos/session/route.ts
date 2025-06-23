import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { openingCash } = await request.json()

    const { data: session, error } = await supabase
      .from("pos_sessions")
      .insert({
        user_id: user.id,
        start_time: new Date().toISOString(),
        opening_cash: openingCash,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: session, error } = await supabase
      .from("pos_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(session || null)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
