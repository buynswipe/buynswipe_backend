/**
 * Types for the queue-based notification system
 */

export type QueueMessageType =
  | "notification:create"
  | "notification:update"
  | "notification:delete"
  | "delivery:assign"
  | "order:status_update"
  | "payment:status_update"

export interface QueueMessage<T = any> {
  id: string
  type: QueueMessageType
  payload: T
  metadata: {
    timestamp: string
    producer: string
    priority?: "high" | "normal" | "low"
    deduplicationId?: string
    retryCount?: number
    maxRetries?: number
  }
}

export interface NotificationCreatePayload {
  userId: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
  entityType?: string
  entityId?: string
  actionUrl?: string
  data?: Record<string, any>
}

export interface DeliveryAssignPayload {
  orderId: string
  deliveryPartnerId: string
  retailerId: string
  wholesalerId: string
  instructions?: string
  orderDetails: {
    orderNumber: string
    retailerInfo: {
      businessName: string
      address?: string
      city?: string
      pincode?: string
      phone?: string
    }
    wholesalerInfo: {
      businessName: string
      address?: string
      city?: string
      pincode?: string
      phone?: string
    }
  }
}

export interface OrderStatusUpdatePayload {
  orderId: string
  status: string
  previousStatus: string
  retailerId: string
  wholesalerId: string
  deliveryPartnerId?: string
  orderDetails: {
    orderNumber: string
    totalAmount: number
  }
}

export interface PaymentStatusUpdatePayload {
  orderId: string
  paymentId: string
  status: string
  previousStatus: string
  amount: number
  userId: string
  orderNumber: string
}
