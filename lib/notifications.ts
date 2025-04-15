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
  metadata?: Record<string, any>
}

/**
 * Get notifications for a specific user
 * @param userId - The user ID to fetch notifications for
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 * @returns Array of notifications
 */
export async function getUserNotifications(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<{ data: Notification[] | null; error: any }> {
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
 * @param notificationId - The ID of the notification to mark as read
 * @returns Success status and any error
 */
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error: any }> {
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
 * @param userId - The user ID to mark all notifications as read for
 * @returns Success status and any error
 */
export async function markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error: any }> {
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
 * @param userId - The user ID to count unread notifications for
 * @returns Count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<{ count: number; error: any }> {
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
