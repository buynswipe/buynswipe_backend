import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "order" | "delivery" | "payment" | "inventory" | "system"
  actionUrl?: string
  isRead: boolean
  createdAt: string
  priority: "high" | "medium" | "low"
}

export async function sendNotificationToUser(
  userId: string,
  notification: Omit<Notification, "id" | "createdAt" | "isRead">,
) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const notificationData = {
      id: uuidv4(),
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      action_url: notification.actionUrl,
      priority: notification.priority,
      is_read: false,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("notifications").insert([notificationData])

    if (error) throw error

    // Trigger real-time notification
    await supabase
      .from("notifications")
      .on("*", { event: "INSERT", schema: "public", table: "notifications" })
      .subscribe((payload) => {
        if (payload.new.user_id === userId) {
          // Send browser notification if enabled
          if (typeof window !== "undefined" && "Notification" in window) {
            new Notification(notification.title, {
              body: notification.message,
              icon: "/logo.png",
            })
          }
        }
      })

    return { success: true, id: notificationData.id }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { success: false, error }
  }
}

// Role-specific notification generators
export async function notifyLowStock(wholesalerId: string, productName: string, stock: number) {
  return sendNotificationToUser(wholesalerId, {
    title: "📦 Low Stock Alert",
    message: `${productName} stock is at ${stock} units. Reorder soon.`,
    type: "inventory",
    priority: "high",
    actionUrl: "/inventory",
  })
}

export async function notifyOrderReceived(wholesalerId: string, retailerName: string, orderId: string, amount: number) {
  return sendNotificationToUser(wholesalerId, {
    title: "📥 New Order Received",
    message: `${retailerName} placed order for ₹${amount}. Order ID: ${orderId}`,
    type: "order",
    priority: "high",
    actionUrl: `/orders/${orderId}`,
  })
}

export async function notifyDeliveryAssigned(deliveryPartnerId: string, orderId: string, pickupLocation: string) {
  return sendNotificationToUser(deliveryPartnerId, {
    title: "📍 Delivery Assigned",
    message: `New delivery from ${pickupLocation}. Tap to view details.`,
    type: "delivery",
    priority: "high",
    actionUrl: `/delivery/tracking/${orderId}`,
  })
}

export async function notifyEarningsUpdate(deliveryPartnerId: string, amount: number, deliveryCount: number) {
  return sendNotificationToUser(deliveryPartnerId, {
    title: "💰 Earnings Update",
    message: `You earned ₹${amount} from ${deliveryCount} deliveries today.`,
    type: "payment",
    priority: "medium",
    actionUrl: "/earnings",
  })
}

export async function notifyPriceUpdate(wholesalerId: string, productName: string, newPrice: number) {
  return sendNotificationToUser(wholesalerId, {
    title: "💹 Price Updated",
    message: `${productName} price updated to ₹${newPrice} for optimal margins.`,
    type: "system",
    priority: "medium",
    actionUrl: "/pricing",
  })
}
