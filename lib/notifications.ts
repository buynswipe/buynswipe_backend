import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get notifications for a specific user
 * @param userId - The user ID to fetch notifications for
 * @param limit - Optional limit for the number of notifications to fetch
 * @param offset - Optional offset for pagination
 * @returns Array of notifications
 */
export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }

  return data || []
}

/**
 * Mark a specific notification as read
 * @param notificationId - The ID of the notification to mark as read
 * @returns The updated notification
 */
export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .select()
    .single()

  if (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }

  return data
}

/**
 * Mark all notifications for a user as read
 * @param userId - The user ID to mark all notifications as read for
 * @returns The number of notifications updated
 */
export async function markAllNotificationsAsRead(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false)
    .select()

  if (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }

  return data?.length || 0
}

/**
 * Get the count of unread notifications for a user
 * @param userId - The user ID to count unread notifications for
 * @returns The count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) {
    console.error("Error counting unread notifications:", error)
    throw error
  }

  return count || 0
}
