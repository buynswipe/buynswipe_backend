import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { logError } from "@/lib/debug-helpers"

export const dynamic = "force-dynamic"

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

    // Create notification
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: body.user_id,
        title: body.title,
        message: body.message,
        type: body.type,
        is_read: false,
        related_entity_type: body.related_entity_type,
        related_entity_id: body.related_entity_id,
        action_url: body.action_url,
        data: body.data,
      })
      .select()
      .single()

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
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset") as string) : 0
    const unreadOnly = searchParams.get("unread") === "true"

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Build the query
    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Add filter for unread notifications if requested
    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      logError("API - notifications fetch", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    // Process the notifications to ensure data is properly formatted
    const processedNotifications = data.map((notification) => {
      // If data is stored as a string, parse it
      if (notification.data && typeof notification.data === "string") {
        try {
          notification.data = JSON.parse(notification.data)
        } catch (e) {
          // If parsing fails, keep the original string
          console.warn(`Failed to parse notification data for ID ${notification.id}`)
        }
      }
      return notification
    })

    return NextResponse.json({
      notifications: processedNotifications,
      count: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    logError("API - notifications route handler", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { id } = body

    // Validate the request
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the notification
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single()

    if (error) {
      logError("API - notifications update", error)
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }

    return NextResponse.json({ notification: data })
  } catch (error) {
    logError("API - notifications update handler", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
