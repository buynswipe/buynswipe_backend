import { createServerSupabaseClient } from "@/lib/supabase-server"
import { logError } from "@/lib/debug-helpers"

/**
 * Utility functions for order-related operations
 */

/**
 * Finds an order using multiple lookup strategies
 * @param orderId The ID or partial ID of the order to look up
 * @returns The order object or null if not found
 */
export async function findOrder(orderId: string) {
  const supabase = createServerSupabaseClient()
  const order = null

  try {
    // Try direct match first (most common case)
    const { data: directMatch, error: directError } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:retailer_id(*),
        wholesaler:wholesaler_id(*),
        items:order_items(*, product:product_id(*))
      `)
      .eq("id", orderId)
      .maybeSingle()

    if (directError) {
      logError("OrderUtils:findOrder - direct match", directError)
    }

    if (directMatch) {
      return directMatch
    }

    // Try partial ID match
    const { data: partialMatch, error: partialError } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:retailer_id(*),
        wholesaler:wholesaler_id(*),
        items:order_items(*, product:product_id(*))
      `)
      .ilike("id", `${orderId}%`)
      .limit(1)
      .maybeSingle()

    if (partialError) {
      logError("OrderUtils:findOrder - partial match", partialError)
    }

    if (partialMatch) {
      return partialMatch
    }

    // Try notification lookup
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("related_entity_id, data")
      .eq("id", orderId)
      .maybeSingle()

    if (notificationError) {
      logError("OrderUtils:findOrder - notification lookup", notificationError)
    }

    if (notification && notification.related_entity_id) {
      const { data: relatedOrder, error: relatedError } = await supabase
        .from("orders")
        .select(`
          *,
          retailer:retailer_id(*),
          wholesaler:wholesaler_id(*),
          items:order_items(*, product:product_id(*))
        `)
        .eq("id", notification.related_entity_id)
        .maybeSingle()

      if (relatedError) {
        logError("OrderUtils:findOrder - related order", relatedError)
      }

      if (relatedOrder) {
        return relatedOrder
      }
    }

    // No order found with any method
    return null
  } catch (error) {
    logError("OrderUtils:findOrder - unexpected error", error)
    return null
  }
}

/**
 * Checks if a user is assigned to an order as the delivery partner
 * @param userId The user ID to check
 * @param order The order object
 * @returns Boolean indicating if the user is assigned to the order
 */
export async function isUserAssignedToOrder(userId: string, order: any) {
  if (!order?.delivery_partner_id) return false

  const supabase = createServerSupabaseClient()

  try {
    const { data: deliveryPartner, error } = await supabase
      .from("delivery_partners")
      .select("user_id")
      .eq("id", order.delivery_partner_id)
      .maybeSingle()

    if (error) {
      logError("OrderUtils:isUserAssignedToOrder", error)
      return false
    }

    return deliveryPartner?.user_id === userId
  } catch (error) {
    logError("OrderUtils:isUserAssignedToOrder - unexpected error", error)
    return false
  }
}

/**
 * Gets all order details including status updates and delivery proof
 * @param orderId The ID of the order
 * @returns Object containing order details or null if not found
 */
export async function getOrderDetails(orderId: string) {
  const order = await findOrder(orderId)
  if (!order) return null

  const supabase = createServerSupabaseClient()

  try {
    // Get status updates
    const { data: statusUpdates, error: statusError } = await supabase
      .from("delivery_status_updates")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true })

    if (statusError) {
      logError("OrderUtils:getOrderDetails - status updates", statusError)
    }

    // Get delivery proof
    const { data: deliveryProof, error: proofError } = await supabase
      .from("delivery_proofs")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle()

    if (proofError) {
      logError("OrderUtils:getOrderDetails - delivery proof", proofError)
    }

    return {
      order,
      statusUpdates: statusUpdates || [],
      deliveryProof,
      isDelivered: order.status === "delivered",
      isCod: order.payment_method === "cod",
    }
  } catch (error) {
    logError("OrderUtils:getOrderDetails - unexpected error", error)
    return null
  }
}
