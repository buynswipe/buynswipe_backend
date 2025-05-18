import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Types
export type NotificationType = "success" | "info" | "warning" | "error"
export type EntityType = "order" | "payment" | "delivery" | "product" | "user" | "system"

export interface NotificationData {
  user_id: string
  title: string
  message: string
  type: NotificationType
  related_entity_type?: EntityType
  related_entity_id?: string
  action_url?: string
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

    // Ensure user_id is a string
    if (typeof data.user_id !== "string") {
      console.error("Error creating notification: user_id must be a string, received:", typeof data.user_id)
      data.user_id = String(data.user_id)
    }

    // Prepare notification data
    const notificationData: any = {
      id: uuidv4(),
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: data.is_read ?? false,
      created_at: new Date().toISOString(),
    }

    // Add entity type and ID
    if (data.related_entity_type) {
      notificationData.related_entity_type = data.related_entity_type
    }
    if (data.related_entity_id) {
      notificationData.related_entity_id = data.related_entity_id
    }
    if (data.action_url) {
      notificationData.action_url = data.action_url
    }

    // Insert notification
    const { error } = await supabase.from("notifications").insert(notificationData)

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
    user_id: userId,
    title,
    message,
    type: notificationType,
    related_entity_type: "order" as EntityType,
    related_entity_id: orderId,
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
    user_id: userId,
    title: `Delivery Update: ${status}`,
    message,
    type: "info" as NotificationType,
    related_entity_type: "delivery" as EntityType,
    related_entity_id: orderId,
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
    user_id: userId,
    title,
    message,
    type,
    related_entity_type: "payment" as EntityType,
    related_entity_id: orderId,
    action_url: `/orders/${orderId}`,
  }

  return createServerNotification(notificationData)
}
