/**
 * Queue service for handling asynchronous operations
 */
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import type { QueueMessage, QueueMessageType } from "./types"

// Create a Supabase client for queue operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: {
    persistSession: false,
  },
})

/**
 * Queue service for handling asynchronous operations
 */
export class QueueService {
  /**
   * Initialize the queue tables if they don't exist
   */
  static async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the message_queue table exists
      const { error: checkError } = await supabase.from("message_queue").select("id").limit(1).single()

      // If the table exists, we're good
      if (!checkError || checkError.code !== "PGRST116") {
        return { success: true }
      }

      // Create the message_queue table
      const { error } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS public.message_queue (
          id UUID PRIMARY KEY,
          type TEXT NOT NULL,
          payload JSONB NOT NULL,
          metadata JSONB NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE,
          error TEXT,
          retry_count INTEGER DEFAULT 0,
          locked_until TIMESTAMP WITH TIME ZONE,
          locked_by TEXT
        );

        CREATE INDEX IF NOT EXISTS message_queue_status_idx ON public.message_queue(status);
        CREATE INDEX IF NOT EXISTS message_queue_type_idx ON public.message_queue(type);
        CREATE INDEX IF NOT EXISTS message_queue_created_at_idx ON public.message_queue(created_at);
      `

      if (error) {
        console.error("Error creating message_queue table:", error)
        return { success: false, error: error.message }
      }

      // Create the processed_messages table for deduplication
      const { error: dedupError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS public.processed_messages (
          deduplication_id TEXT PRIMARY KEY,
          message_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS processed_messages_created_at_idx ON public.processed_messages(created_at);
      `

      if (dedupError) {
        console.error("Error creating processed_messages table:", dedupError)
        return { success: false, error: dedupError.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error initializing queue:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Enqueue a message for processing
   */
  static async enqueue<T>(
    type: QueueMessageType,
    payload: T,
    options: {
      priority?: "high" | "normal" | "low"
      deduplicationId?: string
      maxRetries?: number
      producer?: string
    } = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { priority = "normal", deduplicationId, maxRetries = 3, producer = "system" } = options

      // Check for deduplication if ID is provided
      if (deduplicationId) {
        const { data: existingMessage } = await supabase
          .from("processed_messages")
          .select("message_id")
          .eq("deduplication_id", deduplicationId)
          .single()

        if (existingMessage) {
          return {
            success: true,
            messageId: existingMessage.message_id,
            error: "Duplicate message detected and skipped",
          }
        }
      }

      // Create the message
      const messageId = uuidv4()
      const message: QueueMessage<T> = {
        id: messageId,
        type,
        payload,
        metadata: {
          timestamp: new Date().toISOString(),
          producer,
          priority,
          deduplicationId,
          maxRetries,
          retryCount: 0,
        },
      }

      // Insert the message into the queue
      const { error } = await supabase.from("message_queue").insert({
        id: message.id,
        type: message.type,
        payload: message.payload,
        metadata: message.metadata,
        status: "pending",
      })

      if (error) {
        console.error("Error enqueueing message:", error)
        return { success: false, error: error.message }
      }

      // If deduplication is enabled, record the message
      if (deduplicationId) {
        await supabase.from("processed_messages").insert({
          deduplication_id: deduplicationId,
          message_id: messageId,
        })
      }

      return { success: true, messageId }
    } catch (error: any) {
      console.error("Error enqueueing message:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Process the next batch of messages in the queue
   */
  static async processNextBatch(
    options: {
      batchSize?: number
      lockDuration?: number
      processorId?: string
      messageTypes?: QueueMessageType[]
    } = {},
  ): Promise<{ success: boolean; processedCount: number; error?: string }> {
    const {
      batchSize = 10,
      lockDuration = 60, // seconds
      processorId = `processor-${uuidv4()}`,
      messageTypes,
    } = options

    try {
      // Begin a transaction
      const { error: txError } = await supabase.rpc("begin_transaction")
      if (txError) {
        console.error("Error beginning transaction:", txError)
        return { success: false, processedCount: 0, error: txError.message }
      }

      // Get and lock the next batch of messages
      let query = supabase
        .from("message_queue")
        .select("*")
        .eq("status", "pending")
        .is("locked_by", null)
        .or(`locked_until.is.null,locked_until.lt.${new Date().toISOString()}`)
        .order("created_at", { ascending: true })
        .limit(batchSize)

      // Filter by message types if specified
      if (messageTypes && messageTypes.length > 0) {
        query = query.in("type", messageTypes)
      }

      const { data: messages, error: fetchError } = await query

      if (fetchError) {
        await supabase.rpc("rollback_transaction")
        console.error("Error fetching messages:", fetchError)
        return { success: false, processedCount: 0, error: fetchError.message }
      }

      if (!messages || messages.length === 0) {
        await supabase.rpc("commit_transaction")
        return { success: true, processedCount: 0 }
      }

      // Lock the messages
      const lockUntil = new Date(Date.now() + lockDuration * 1000).toISOString()
      const messageIds = messages.map((m) => m.id)

      const { error: lockError } = await supabase
        .from("message_queue")
        .update({
          locked_by: processorId,
          locked_until: lockUntil,
        })
        .in("id", messageIds)

      if (lockError) {
        await supabase.rpc("rollback_transaction")
        console.error("Error locking messages:", lockError)
        return { success: false, processedCount: 0, error: lockError.message }
      }

      await supabase.rpc("commit_transaction")

      // Process each message
      let processedCount = 0
      for (const message of messages) {
        const result = await this.processMessage(message)
        if (result.success) {
          processedCount++
        }
      }

      return { success: true, processedCount }
    } catch (error: any) {
      console.error("Error processing message batch:", error)
      return { success: false, processedCount: 0, error: error.message }
    }
  }

  /**
   * Process a single message
   */
  private static async processMessage(message: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Begin processing
      const { error: updateError } = await supabase
        .from("message_queue")
        .update({
          status: "processing",
        })
        .eq("id", message.id)

      if (updateError) {
        console.error(`Error updating message ${message.id} status:`, updateError)
        return { success: false, error: updateError.message }
      }

      // Process the message based on its type
      let result: { success: boolean; error?: string } = { success: false }

      try {
        switch (message.type) {
          case "notification:create":
            result = await this.handleNotificationCreate(message.payload)
            break
          case "delivery:assign":
            result = await this.handleDeliveryAssign(message.payload)
            break
          case "order:status_update":
            result = await this.handleOrderStatusUpdate(message.payload)
            break
          case "payment:status_update":
            result = await this.handlePaymentStatusUpdate(message.payload)
            break
          default:
            result = {
              success: false,
              error: `Unknown message type: ${message.type}`,
            }
        }
      } catch (processingError: any) {
        result = {
          success: false,
          error: `Error processing message: ${processingError.message}`,
        }
      }

      // Update the message status based on the result
      if (result.success) {
        await supabase
          .from("message_queue")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
            locked_by: null,
            locked_until: null,
          })
          .eq("id", message.id)
      } else {
        const metadata = message.metadata || {}
        const retryCount = (metadata.retryCount || 0) + 1
        const maxRetries = metadata.maxRetries || 3

        if (retryCount <= maxRetries) {
          // Update retry count and reset locks
          await supabase
            .from("message_queue")
            .update({
              status: "pending",
              error: result.error,
              retry_count: retryCount,
              metadata: {
                ...metadata,
                retryCount,
              },
              locked_by: null,
              locked_until: null,
            })
            .eq("id", message.id)
        } else {
          // Mark as failed after max retries
          await supabase
            .from("message_queue")
            .update({
              status: "failed",
              error: result.error,
              processed_at: new Date().toISOString(),
              locked_by: null,
              locked_until: null,
            })
            .eq("id", message.id)
        }
      }

      return result
    } catch (error: any) {
      console.error(`Error processing message ${message.id}:`, error)

      // Ensure the message is unlocked even if there's an error
      await supabase
        .from("message_queue")
        .update({
          locked_by: null,
          locked_until: null,
        })
        .eq("id", message.id)

      return { success: false, error: error.message }
    }
  }

  /**
   * Handle notification creation
   */
  private static async handleNotificationCreate(payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { userId, title, message, type, entityType, entityId, actionUrl, data } = payload

      // Create the notification
      const { error } = await supabase.from("notifications").insert({
        id: uuidv4(),
        user_id: userId,
        title,
        message,
        type,
        related_entity_type: entityType,
        related_entity_id: entityId,
        action_url: actionUrl,
        data,
        is_read: false,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating notification:", error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error handling notification creation:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Handle delivery assignment
   */
  private static async handleDeliveryAssign(payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { orderId, deliveryPartnerId, retailerId, wholesalerId, orderDetails } = payload

      // Create notifications for all parties

      // 1. Notification for delivery partner
      await this.handleNotificationCreate({
        userId: deliveryPartnerId,
        title: "New Delivery Assignment",
        message: `You have been assigned to deliver order #${orderDetails.orderNumber} to ${orderDetails.retailerInfo.businessName} in ${orderDetails.retailerInfo.city || "your area"}.`,
        type: "info",
        entityType: "delivery",
        entityId: orderId,
        actionUrl: `/delivery-partner/tracking/${orderId}`,
        data: {
          // Include both pickup and delivery addresses
          pickup_address: orderDetails.wholesalerInfo.address,
          pickup_city: orderDetails.wholesalerInfo.city,
          pickup_pincode: orderDetails.wholesalerInfo.pincode,
          pickup_phone: orderDetails.wholesalerInfo.phone,
          pickup_business_name: orderDetails.wholesalerInfo.businessName,

          address: orderDetails.retailerInfo.address,
          city: orderDetails.retailerInfo.city,
          pincode: orderDetails.retailerInfo.pincode,
          phone: orderDetails.retailerInfo.phone,
          business_name: orderDetails.retailerInfo.businessName,
        },
      })

      // 2. Notification for retailer
      await this.handleNotificationCreate({
        userId: retailerId,
        title: "Delivery Partner Assigned",
        message: `A delivery partner has been assigned to deliver your order #${orderDetails.orderNumber}.`,
        type: "info",
        entityType: "delivery",
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
      })

      // 3. Notification for wholesaler
      await this.handleNotificationCreate({
        userId: wholesalerId,
        title: "Delivery Partner Assigned",
        message: `A delivery partner has been assigned to deliver order #${orderDetails.orderNumber} to ${orderDetails.retailerInfo.businessName}.`,
        type: "info",
        entityType: "delivery",
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
      })

      return { success: true }
    } catch (error: any) {
      console.error("Error handling delivery assignment:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Handle order status update
   */
  private static async handleOrderStatusUpdate(payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { orderId, status, retailerId, wholesalerId, deliveryPartnerId, orderDetails } = payload

      // Format status for display
      const formattedStatus = status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

      // Create notifications for all parties

      // 1. Notification for retailer
      await this.handleNotificationCreate({
        userId: retailerId,
        title: `Order Status Updated: ${formattedStatus}`,
        message: `Your order #${orderDetails.orderNumber} has been ${status.toLowerCase()}.`,
        type: this.getNotificationTypeForStatus(status),
        entityType: "order",
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
      })

      // 2. Notification for wholesaler
      await this.handleNotificationCreate({
        userId: wholesalerId,
        title: `Order Status Updated: ${formattedStatus}`,
        message: `Order #${orderDetails.orderNumber} has been ${status.toLowerCase()}.`,
        type: this.getNotificationTypeForStatus(status),
        entityType: "order",
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
      })

      // 3. Notification for delivery partner (if assigned)
      if (deliveryPartnerId) {
        await this.handleNotificationCreate({
          userId: deliveryPartnerId,
          title: `Delivery Update: ${formattedStatus}`,
          message: `Delivery for order #${orderDetails.orderNumber} has been ${status.toLowerCase()}.`,
          type: this.getNotificationTypeForStatus(status),
          entityType: "order",
          entityId: orderId,
          actionUrl: `/delivery-partner/tracking/${orderId}`,
        })
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error handling order status update:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Handle payment status update
   */
  private static async handlePaymentStatusUpdate(payload: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { orderId, status, userId, amount, orderNumber } = payload

      let title, message, type

      switch (status) {
        case "paid":
        case "success":
          title = "Payment Successful"
          message = `Your payment of ₹${amount.toFixed(2)} for order #${orderNumber} has been completed successfully.`
          type = "success"
          break
        case "failed":
          title = "Payment Failed"
          message = `Your payment for order #${orderNumber} has failed. Please try again or contact support.`
          type = "error"
          break
        case "pending":
          title = "Payment Processing"
          message = `Your payment for order #${orderNumber} is being processed. We'll notify you once it's completed.`
          type = "info"
          break
        default:
          title = "Payment Update"
          message = `Payment status for order #${orderNumber} has been updated to ${status}.`
          type = "info"
      }

      // Create notification
      await this.handleNotificationCreate({
        userId,
        title,
        message,
        type,
        entityType: "payment",
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
      })

      return { success: true }
    } catch (error: any) {
      console.error("Error handling payment status update:", error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Helper to determine notification type based on order status
   */
  private static getNotificationTypeForStatus(status: string): "success" | "info" | "warning" | "error" {
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

  /**
   * Clean up old processed messages to prevent the table from growing too large
   */
  static async cleanupProcessedMessages(
    options: {
      olderThan?: number // days
    } = {},
  ): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      const { olderThan = 30 } = options
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThan)

      const { data, error } = await supabase
        .from("processed_messages")
        .delete()
        .lt("created_at", cutoffDate.toISOString())
        .select("count")

      if (error) {
        console.error("Error cleaning up processed messages:", error)
        return { success: false, deletedCount: 0, error: error.message }
      }

      return { success: true, deletedCount: data?.length || 0 }
    } catch (error: any) {
      console.error("Error cleaning up processed messages:", error)
      return { success: false, deletedCount: 0, error: error.message }
    }
  }
}
