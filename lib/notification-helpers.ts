import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"
import type { CreateNotificationData } from "@/lib/notifications"
import { createNotification } from "./server-notifications"

// Create order status notification
export async function createOrderStatusNotification(
  orderId: string,
  status: string,
  role: "retailer" | "wholesaler" | "delivery_partner" | "all",
) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    // Get order details with retailer and wholesaler info
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        retailer_id,
        wholesaler_id,
        delivery_partner_id,
        total_amount,
        status
      `)
      .eq("id", orderId)
      .single()

    if (error) throw error

    // Format status for display
    const formattedStatus = status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

    // Create notification based on role
    if (role === "retailer" || role === "all") {
      await createNotificationForUser({
        user_id: order.retailer_id,
        title: `Order Status Updated: ${formattedStatus}`,
        message: `Your order #${orderId.substring(0, 8)} has been ${formattedStatus.toLowerCase()}.`,
        type: getNotificationTypeForStatus(status),
        related_entity_type: "order",
        related_entity_id: orderId,
      })
    }

    if (role === "wholesaler" || role === "all") {
      await createNotificationForUser({
        user_id: order.wholesaler_id,
        title: `Order Status Updated: ${formattedStatus}`,
        message: `Order #${orderId.substring(0, 8)} has been ${formattedStatus.toLowerCase()}.`,
        type: getNotificationTypeForStatus(status),
        related_entity_type: "order",
        related_entity_id: orderId,
      })
    }

    if ((role === "delivery_partner" || role === "all") && order.delivery_partner_id) {
      await createNotificationForUser({
        user_id: order.delivery_partner_id,
        title: `Delivery Update: ${formattedStatus}`,
        message: `Delivery for order #${orderId.substring(0, 8)} has been ${formattedStatus.toLowerCase()}.`,
        type: getNotificationTypeForStatus(status),
        related_entity_type: "order",
        related_entity_id: orderId,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating order status notification:", error)
    return { success: false, error }
  }
}

// Create payment notification
export async function createPaymentNotification(
  orderId: string,
  status: "success" | "failed" | "pending",
  userId: string,
) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    // Get order details
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount
      `)
      .eq("id", orderId)
      .single()

    if (error) throw error

    let title, message, type

    switch (status) {
      case "success":
        title = "Payment Successful"
        message = `Your payment of ₹${order.total_amount.toFixed(2)} for order #${orderId.substring(0, 8)} has been completed successfully.`
        type = "success"
        break
      case "failed":
        title = "Payment Failed"
        message = `Your payment for order #${orderId.substring(0, 8)} has failed. Please try again or contact support.`
        type = "error"
        break
      case "pending":
        title = "Payment Processing"
        message = `Your payment for order #${orderId.substring(0, 8)} is being processed. We'll notify you once it's completed.`
        type = "info"
        break
    }

    await createNotificationForUser({
      user_id: userId,
      title,
      message,
      type,
      related_entity_type: "payment",
      related_entity_id: orderId,
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating payment notification:", error)
    return { success: false, error }
  }
}

// Helper to create notification for a specific user
async function createNotificationForUser(data: CreateNotificationData) {
  try {
    const result = await createNotification(data)
    return { success: !result.error, error: result.error }
  } catch (error) {
    console.error("Error creating notification for user:", error)
    return { success: false, error }
  }
}

// Helper to determine notification type based on order status
function getNotificationTypeForStatus(status: string): "success" | "info" | "warning" | "error" {
  switch (status) {
    case "confirmed":
    case "delivered":
      return "success"
    case "placed":
    case "dispatched":
      return "info"
    case "rejected":
      return "error"
    default:
      return "info"
  }
}
