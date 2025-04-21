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
  entity_type?: EntityType
  entity_id?: string
  action_url?: string
  is_read?: boolean
  data?: any
}

// Create a Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: {
    persistSession: false,
  },
})

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

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

    // Validate UUID format for user_id and entity_id
    if (!isValidUUID(data.user_id)) {
      console.error("Error creating notification: user_id is not a valid UUID")
      return { success: false, error: "user_id is not a valid UUID" }
    }

    let entity_id = data.entity_id
    if (data.entity_id && !isValidUUID(data.entity_id)) {
      console.warn("Error creating notification: entity_id is not a valid UUID, setting to null")
      entity_id = null
    }

    // Check if notifications table exists
    const { error: tableCheckError } = await supabase.from("notifications").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes('relation "notifications" does not exist')) {
      console.warn("Notifications table does not exist:", tableCheckError.message)
      return { success: false, error: "Notifications table does not exist" }
    }

    // Check if the data column exists
    const { data: columnInfo, error: columnCheckError } = await supabase.rpc("exec_sql", {
      sql_query: `
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'notifications' 
       AND column_name = 'data'
     `,
    })

    // If data column doesn't exist or there was an error checking, don't include data in the insert
    const hasDataColumn = !columnCheckError && columnInfo && columnInfo.length > 0

    // Prepare notification object
    const notification: any = {
      id: uuidv4(),
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: data.is_read ?? false,
      created_at: new Date().toISOString(),
    }

    // Only add these fields if they exist in the schema
    if (hasDataColumn && data.data) {
      notification.data = data.data
    }

    // Check if related_entity_type column exists
    const { data: relatedEntityTypeColumn } = await supabase.rpc("exec_sql", {
      sql_query: `
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'notifications' 
       AND column_name = 'related_entity_type'
     `,
    })

    if (relatedEntityTypeColumn && relatedEntityTypeColumn.length > 0 && data.entity_type) {
      notification.related_entity_type = data.entity_type
    }

    // Check if related_entity_id column exists
    const { data: relatedEntityIdColumn } = await supabase.rpc("exec_sql", {
      sql_query: `
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'notifications' 
       AND column_name = 'related_entity_id'
     `,
    })

    if (relatedEntityIdColumn && relatedEntityIdColumn.length > 0 && entity_id) {
      notification.related_entity_id = entity_id
    }

    // Check if action_url column exists
    const { data: actionUrlColumn } = await supabase.rpc("exec_sql", {
      sql_query: `
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'notifications' 
       AND column_name = 'action_url'
     `,
    })

    if (actionUrlColumn && actionUrlColumn.length > 0 && data.action_url) {
      notification.action_url = data.action_url
    }

    // Insert notification
    const { error } = await supabase.from("notifications").insert(notification)

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
    user_id: userId,
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
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} has failed. Please try again or contact support.`
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
    entity_type: "payment" as EntityType,
    entity_id: orderId,
    action_url: `/orders/${orderId}`,
  }

  return createServerNotification(notificationData)
}
