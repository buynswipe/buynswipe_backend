import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

// Type definitions for notifications
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  link?: string
  data?: Record<string, any>
}

/**
 * Get notifications for a specific user
 */
export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, error }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { data: null, error }
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    return { success: !error, error }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error }
  }
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)

    return { success: !error, error }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error }
  }
}

/**
 * Get the count of unread notifications for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)

    return { count: count || 0, error }
  } catch (error) {
    console.error("Error counting unread notifications:", error)
    return { count: 0, error }
  }
}
