import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

/**
 * Sends a notification to a delivery partner about a new order assignment
 * This version is compatible with both App Router and Pages Router
 */
export async function notifyDeliveryPartnerOfAssignment(
  deliveryPartnerId: string,
  orderId: string,
  orderDetails: { retailerName?: string; totalAmount?: number } = {},
) {
  const supabase = createClientComponentClient<Database>()

  try {
    // First, get the delivery partner details
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("user_id, name")
      .eq("id", deliveryPartnerId)
      .single()

    if (partnerError || !partner || !partner.user_id) {
      console.error("Error fetching delivery partner for notification:", partnerError || "No user_id found")
      return { success: false, error: "Delivery partner not found or not linked to a user" }
    }

    // Create a notification for the delivery partner
    const orderIdShort = orderId.substring(0, 8)
    const { retailerName, totalAmount } = orderDetails

    const notificationMessage = `New delivery assignment: Order #${orderIdShort}${
      retailerName ? ` for ${retailerName}` : ""
    }${totalAmount ? ` (₹${totalAmount.toFixed(2)})` : ""}`

    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: partner.user_id,
      type: "delivery",
      title: "New Delivery Assignment",
      message: notificationMessage,
      data: { orderId, deliveryPartnerId },
      is_read: false,
    })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      return { success: false, error: "Failed to create notification" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in notifyDeliveryPartnerOfAssignment:", error)
    return { success: false, error: "Failed to send notification" }
  }
}

/**
 * Updates all relevant parties about a delivery status change
 * This version is compatible with both App Router and Pages Router
 */
export async function notifyDeliveryStatusUpdate(orderId: string, status: string, deliveryPartnerId: string) {
  const supabase = createClientComponentClient<Database>()

  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("retailer_id, wholesaler_id")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("Error fetching order for notifications:", orderError)
      return { success: false, error: "Order not found" }
    }

    // Format status for display
    const formattedStatus = status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

    const orderIdShort = orderId.substring(0, 8)
    const statusMessage = `Order #${orderIdShort} delivery status: ${formattedStatus}`

    // Notify retailer
    if (order.retailer_id) {
      const { error: retailerNotificationError } = await supabase.from("notifications").insert({
        user_id: order.retailer_id,
        type: "delivery",
        title: "Delivery Status Update",
        message: statusMessage,
        data: { orderId, status },
        is_read: false,
      })
      if (retailerNotificationError) {
        console.error("Error creating retailer notification:", retailerNotificationError)
      }
    }

    // Notify wholesaler
    if (order.wholesaler_id) {
      const { error: wholesalerNotificationError } = await supabase.from("notifications").insert({
        user_id: order.wholesaler_id,
        type: "delivery",
        title: "Delivery Status Update",
        message: statusMessage,
        data: { orderId, status },
        is_read: false,
      })
      if (wholesalerNotificationError) {
        console.error("Error creating wholesaler notification:", wholesalerNotificationError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in notifyDeliveryStatusUpdate:", error)
    return { success: false, error: "Failed to send notifications" }
  }
}
