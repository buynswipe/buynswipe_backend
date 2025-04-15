import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"
import type { PostgrestError } from "@supabase/supabase-js"
import type { CreateNotificationData, Notification } from "./notifications"

// Server-side notification creation function
export async function createNotification(
  data: CreateNotificationData,
): Promise<{ data: Notification | null; error: PostgrestError | null }> {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        related_entity_type: data.related_entity_type,
        related_entity_id: data.related_entity_id,
      })
      .select("*")
      .single()

    return { data: notification as Notification | null, error }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { data: null, error: error as PostgrestError }
  }
}
