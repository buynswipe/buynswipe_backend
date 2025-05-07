import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

// Type definitions for notifications
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  related_entity_type?: string
  related_entity_id?: string
  action_url?: string
  data?: Record<string, any>
}

// Type for creating a new notification
export interface CreateNotificationData {
  user_id: string
  title: string
  message: string
  type: string
  related_entity_type?: string
  related_entity_id?: string
  action_url?: string
  data?: Record<string, any>
}

/**
 * Get notifications for a specific user
 * @param userId - The user ID to fetch notifications for
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 * @returns Array of notifications
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

    return { data: data as Notification[] | null, error }
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
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

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
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

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
export async function getUnreadNotificationCount(userId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    return { count: count || 0, error }
  } catch (error) {
    console.error("Error counting unread notifications:", error)
    return { count: 0, error }
  }
}

/**
 * Create a new notification
 * @param data - The notification data
 * @returns The created notification
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        is_read: false,
        related_entity_type: data.related_entity_type,
        related_entity_id: data.related_entity_id,
        action_url: data.action_url,
        data: data.data,
      })
      .select()
      .single()

    return { data: notification as Notification | null, error }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { data: null, error }
  }
}

/**
 * Delete a notification
 * @param notificationId - The ID of the notification to delete
 * @returns Success status and any error
 */
export async function deleteNotification(notificationId: string) {
  try {
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

    return { success: !error, error }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error }
  }
}

/**
 * Set up real-time subscription for new notifications
 * @param userId - The user ID to subscribe to notifications for
 * @param callback - The callback function to call when a new notification is received
 * @returns A function to unsubscribe from the subscription
 */
export function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  const supabase = createClientComponentClient<Database>()

  const subscription = supabase
    .channel(`user-notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      },
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
