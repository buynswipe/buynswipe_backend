import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    // Validate required fields
    if (!body.id && !body.all) {
      return NextResponse.json({ error: "Missing notification ID or 'all' flag" }, { status: 400 })
    }

    let result

    if (body.all) {
      // Mark all notifications as read
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false)
        .select()

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = { success: true, count: data?.length || 0 }
    } else {
      // Mark single notification as read
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", body.id)
        .eq("user_id", session.user.id) // Ensure user only updates their own notifications
        .select()
        .single()

      if (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = { success: true, notification: data }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error in mark-read API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
