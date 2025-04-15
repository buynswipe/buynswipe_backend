import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Types
export type NotificationType = "success" | "info" | "warning" | "error"
export type EntityType = "order" | "payment" | "delivery" | "product" | "user" | "system"

export interface NotificationData {
  user_id: string // Changed from userId to user_id for consistency
  title: string
  message: string
  type: NotificationType
  entity_type?: EntityType // Changed from entityType to entity_type
  entity_id?: string // Changed from entityId to entity_id
  action_url?: string // Changed from actionUrl to action_url
  is_read?: boolean
}

// Create a Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: {
    persistSession: false,
  },
})

/**
 * Creates a notification in the database
 */
export async function createServerNotification(data: NotificationData) {
  try {
    // Validate required fields
    if (!data.user_id) {
      console.error("Error creating notification: user_id is required")
      return { success: false, error: "user_id is required" }
    }

    // Check if notifications table exists
    const { error: tableCheckError } = await supabase.from("notifications").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes('relation "notifications" does not exist')) {
      console.warn("Notifications table does not exist:", tableCheckError.message)
      return { success: false, error: "Notifications table does not exist" }
    }

    // Insert notification
    const { error } = await supabase.from("notifications").insert({
      id: uuidv4(),
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      action_url: data.action_url,
      is_read: data.is_read ?? false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating notification:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in createServerNotification:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Helper function to create order-related notifications
 */
export async function createOrderNotification({
  userId,
  orderId,
  orderNumber,
  status,
  message,
}: {
  userId: string
  orderId: string
  orderNumber: string
  status: string
  message: string
}) {
  const statusMap: Record<string, NotificationType> = {
    placed: "info",
    confirmed: "success",
    dispatched: "info",
    delivered: "success",
    rejected: "error",
  }

  const notificationType = statusMap[status] || "info"
  const title = `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`

  const notificationData = {
    user_id: userId, // Correctly map userId to user_id
    title,
    message,
    type: notificationType,
    entity_type: "order" as EntityType,
    entity_id: orderId,
    action_url: `/orders/${orderId}`,
  }

  return createServerNotification(notificationData)
}

/**
 * Helper function to create delivery-related notifications
 */
export async function createDeliveryNotification({
  userId,
  orderId,
  orderNumber,
  status,
  message,
}: {
  userId: string
  orderId: string
  orderNumber: string
  status: string
  message: string
}) {
  const notificationData = {
    user_id: userId, // Correctly map userId to user_id
    title: `Delivery Update: ${status}`,
    message,
    type: "info" as NotificationType,
    entity_type: "delivery" as EntityType,
    entity_id: orderId,
    action_url: `/orders/${orderId}`,
  }

  return createServerNotification(notificationData)
}

/**
 * Helper function to create payment-related notifications
 */
export async function createPaymentNotification({
  userId,
  orderId,
  orderNumber,
  status,
  amount,
}: {
  userId: string
  orderId: string
  orderNumber: string
  status: string
  amount: number
}) {
  let title = ""
  let message = ""
  let type: NotificationType = "info"

  switch (status) {
    case "paid":
      title = "Payment Received"
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} has been received.`
      type = "success"
      break
    case "pending":
      title = "Payment Pending"
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} is pending.`
      type = "info"
      break
    case "failed":
      title = "Payment Failed"
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} has failed.`
      type = "error"
      break
    default:
      title = "Payment Update"
      message = `Payment status for Order #${orderNumber} has been updated to ${status}.`
  }

  const notificationData = {
    user_id: userId, // Correctly map userId to user_id
    title,
    message,
    type,
    entity_type: "payment" as EntityType,
    entity_id: orderId,
    action_url: `/orders/${orderId}`,
  }

  return createServerNotification(notificationData)
}
