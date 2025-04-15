import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createNotification } from "@/lib/server-notifications"

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
    if (!body.user_id || !body.title || !body.message || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has permission to create notification for this user_id
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Only allow creating notifications for other users if admin
    if (body.user_id !== session.user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create notification data object
    const notificationData = {
      user_id: body.user_id,
      title: body.title,
      message: body.message,
      type: body.type,
      related_entity_type: body.related_entity_type,
    }

    // Only add related_entity_id if it exists
    if (body.related_entity_id) {
      notificationData.related_entity_id = body.related_entity_id
    }

    // Create the notification
    const { data, error } = await createNotification(notificationData)

    if (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, notification: data })
  } catch (error: any) {
    console.error("Error in notifications API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse URL parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unread") === "true"
    const orderBy = searchParams.get("order") === "oldest" ? "oldest" : "newest"

    // Prepare query
    let query = supabase.from("notifications").select("*").eq("user_id", session.user.id)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data, error } = await query.order("created_at", { ascending: orderBy === "oldest" }).limit(limit)

    if (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notifications: data })
  } catch (error: any) {
    console.error("Error in notifications API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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
    if (!body.id) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })
    }

    // Update the notification (mark as read)
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", body.id)
      .eq("user_id", session.user.id) // Ensure user only updates their own notifications
      .select()
      .single()

    if (error) {
      console.error("Error updating notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, notification: data })
  } catch (error: any) {
    console.error("Error in notifications API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
