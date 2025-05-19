import { QueueService } from "./queue-service"
import type {
  NotificationCreatePayload,
  DeliveryAssignPayload,
  OrderStatusUpdatePayload,
  PaymentStatusUpdatePayload,
} from "./types"

/**
 * Notification producer for the queue-based notification system
 */
export class NotificationProducer {
  /**
   * Create a notification
   */
  static async createNotification(
    payload: NotificationCreatePayload,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate a deduplication ID based on the notification content
      const deduplicationId = `notification:${payload.userId}:${payload.entityType || ""}:${payload.entityId || ""}:${Date.now()}`

      return await QueueService.enqueue("notification:create", payload, {
        deduplicationId,
        producer: "notification-producer",
      })
    } catch (error: any) {
      console.error("Error creating notification:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create a delivery assignment notification
   */
  static async createDeliveryAssignmentNotification(
    payload: DeliveryAssignPayload,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate a deduplication ID based on the order and delivery partner
      const deduplicationId = `delivery:assign:${payload.orderId}:${payload.deliveryPartnerId}`

      return await QueueService.enqueue("delivery:assign", payload, {
        deduplicationId,
        priority: "high", // Delivery assignments are high priority
        producer: "notification-producer",
      })
    } catch (error: any) {
      console.error("Error creating delivery assignment notification:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create an order status update notification
   */
  static async createOrderStatusUpdateNotification(
    payload: OrderStatusUpdatePayload,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate a deduplication ID based on the order and status
      const deduplicationId = `order:status:${payload.orderId}:${payload.status}`

      return await QueueService.enqueue("order:status_update", payload, {
        deduplicationId,
        producer: "notification-producer",
      })
    } catch (error: any) {
      console.error("Error creating order status update notification:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create a payment status update notification
   */
  static async createPaymentStatusUpdateNotification(
    payload: PaymentStatusUpdatePayload,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate a deduplication ID based on the payment and status
      const deduplicationId = `payment:status:${payload.paymentId}:${payload.status}`

      return await QueueService.enqueue("payment:status_update", payload, {
        deduplicationId,
        producer: "notification-producer",
      })
    } catch (error: any) {
      console.error("Error creating payment status update notification:", error)
      return { success: false, error: error.message }
    }
  }
}
