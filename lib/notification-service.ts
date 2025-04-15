import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export type NotificationType = "order" | "inventory" | "payment" | "delivery" | "system"

interface SendNotificationParams {
  userId: string
  title: string
  message: string
  type: NotificationType
  actionUrl?: string
  referenceId?: string
}

export async function sendNotification({
  userId,
  title,
  message,
  type,
  actionUrl,
  referenceId,
}: SendNotificationParams) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Create a notification object without the reference_id field
    const notificationData = {
      id: uuidv4(),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      action_url: actionUrl,
      // Only include reference_id if it's provided
      ...(referenceId ? { reference_id: referenceId } : {}),
    }

    const { error } = await supabase.from("notifications").insert(notificationData)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, error }
  }
}

// Helper function to send order notifications
export async function sendOrderNotification(
  wholesalerId: string,
  orderId: string,
  status: string,
  orderNumber: string,
) {
  let title = ""
  let message = ""
  const actionUrl = `/orders/${orderId}`

  switch (status) {
    case "placed":
      title = "New Order Received"
      message = `Order #${orderNumber} has been placed and is waiting for confirmation.`
      break
    case "confirmed":
      title = "Order Confirmed"
      message = `Order #${orderNumber} has been confirmed and is ready for dispatch.`
      break
    case "dispatched":
      title = "Order Dispatched"
      message = `Order #${orderNumber} has been dispatched and is on its way.`
      break
    case "delivered":
      title = "Order Delivered"
      message = `Order #${orderNumber} has been delivered successfully.`
      break
    case "rejected":
      title = "Order Rejected"
      message = `Order #${orderNumber} has been rejected.`
      break
    default:
      title = "Order Update"
      message = `Order #${orderNumber} status has been updated to ${status}.`
  }

  return sendNotification({
    userId: wholesalerId,
    title,
    message,
    type: "order",
    actionUrl,
    referenceId: orderId,
  })
}

// Helper function to send inventory notifications
export async function sendInventoryAlert(
  wholesalerId: string,
  productId: string,
  productName: string,
  stockQuantity: number,
) {
  return sendNotification({
    userId: wholesalerId,
    title: "Low Stock Alert",
    message: `${productName} is running low on stock (${stockQuantity} units remaining).`,
    type: "inventory",
    actionUrl: `/products`,
    referenceId: productId,
  })
}

// Helper function to send payment notifications
export async function sendPaymentNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string,
  amount: number,
) {
  let title = ""
  let message = ""

  switch (status) {
    case "paid":
      title = "Payment Received"
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} has been received.`
      break
    case "pending":
      title = "Payment Pending"
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} is pending.`
      break
    case "failed":
      title = "Payment Failed"
      message = `Payment of ₹${amount.toFixed(2)} for Order #${orderNumber} has failed.`
      break
    default:
      title = "Payment Update"
      message = `Payment status for Order #${orderNumber} has been updated to ${status}.`
  }

  return sendNotification({
    userId,
    title,
    message,
    type: "payment",
    actionUrl: `/orders/${orderId}`,
    referenceId: orderId,
  })
}

// Helper function to send delivery notifications
export async function sendDeliveryNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string,
  deliveryPartnerName?: string,
) {
  let title = ""
  let message = ""

  switch (status) {
    case "assigned":
      title = "Delivery Partner Assigned"
      message = `${deliveryPartnerName} has been assigned to deliver Order #${orderNumber}.`
      break
    case "in_transit":
      title = "Order In Transit"
      message = `Order #${orderNumber} is now in transit with ${deliveryPartnerName}.`
      break
    case "delivered":
      title = "Order Delivered"
      message = `Order #${orderNumber} has been delivered successfully.`
      break
    default:
      title = "Delivery Update"
      message = `Delivery status for Order #${orderNumber} has been updated to ${status}.`
  }

  return sendNotification({
    userId,
    title,
    message,
    type: "delivery",
    actionUrl: `/orders/${orderId}`,
    referenceId: orderId,
  })
}
