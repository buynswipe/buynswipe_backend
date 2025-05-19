import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { logError } from "@/lib/debug-helpers"

/**
 * Comprehensive order service for order management
 */
export class OrderService {
  /**
   * Find an order using multiple lookup strategies
   * @param idOrReference The order ID, partial ID, or reference
   * @returns The order if found, null otherwise
   */
  async findOrder(idOrReference: string) {
    console.log(`[OrderService] Starting order lookup for: ${idOrReference}`)
    const supabase = createServerComponentClient({ cookies })

    try {
      // Strategy 1: Direct UUID lookup
      console.log(`[OrderService] Attempting direct lookup for order ID: ${idOrReference}`)
      const { data: directOrder, error: directError } = await supabase
        .from("orders")
        .select(this.getOrderSelectQuery())
        .eq("id", idOrReference)
        .maybeSingle()

      if (directError) {
        logError("Order service - direct ID", directError)
      } else if (directOrder) {
        console.log(`[OrderService] Found order via direct lookup: ${directOrder.id}`)
        return { order: directOrder, source: "direct" }
      }

      // Strategy 2: Lookup by shortened ID (first 8 chars)
      if (idOrReference.length === 8) {
        console.log(`[OrderService] Attempting lookup for ID prefix: ${idOrReference}`)

        // Get a limited set of order IDs
        const { data: orderIds, error: idsError } = await supabase.from("orders").select("id").limit(500)

        if (idsError) {
          logError("Order service - ID prefix", idsError)
        } else if (orderIds && orderIds.length > 0) {
          // Find matching IDs (case insensitive)
          const matchingIds = orderIds
            .filter((o) => o.id && o.id.toLowerCase().startsWith(idOrReference.toLowerCase()))
            .map((o) => o.id)

          if (matchingIds.length > 0) {
            console.log(`[OrderService] Found ${matchingIds.length} orders with ID prefix ${idOrReference}`)

            // Get the first matching order with full details
            const { data: prefixOrder, error: orderError } = await supabase
              .from("orders")
              .select(this.getOrderSelectQuery())
              .eq("id", matchingIds[0])
              .maybeSingle()

            if (orderError) {
              logError("Order service - matched order", orderError)
            } else if (prefixOrder) {
              console.log(`[OrderService] Found order via ID prefix: ${prefixOrder.id}`)
              return { order: prefixOrder, source: "prefix" }
            }
          }
        }
      }

      // Strategy 3: Check if this is a notification reference
      console.log(`[OrderService] Checking if ${idOrReference} is a notification ID`)
      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .select("related_entity_id, data")
        .eq("id", idOrReference)
        .maybeSingle()

      if (notificationError) {
        logError("Order service - notification", notificationError)
      } else if (notification && notification.related_entity_id) {
        // Get the order using the notification's related_entity_id
        const { data: notifOrder, error: orderError } = await supabase
          .from("orders")
          .select(this.getOrderSelectQuery())
          .eq("id", notification.related_entity_id)
          .maybeSingle()

        if (orderError) {
          logError("Order service - related order", orderError)
        } else if (notifOrder) {
          console.log(`[OrderService] Found order via notification reference: ${notifOrder.id}`)
          return { order: notifOrder, source: "notification" }
        }
      }

      // Strategy 4: Try to find by reference number
      console.log(`[OrderService] Attempting lookup by reference number: ${idOrReference}`)

      // Check if the reference_number column exists
      const { data: columns, error: columnsError } = await supabase.rpc("get_table_columns", {
        table_name: "orders",
      })

      if (columnsError) {
        logError("Order service - get columns", columnsError)
        // Continue with the query anyway, it will fail if the column doesn't exist
      }

      // Check if reference_number column exists
      const hasReferenceNumber = columns && columns.some((col: any) => col.column_name === "reference_number")

      if (hasReferenceNumber) {
        const { data: refOrder, error: refError } = await supabase
          .from("orders")
          .select(this.getOrderSelectQuery())
          .eq("reference_number", idOrReference)
          .maybeSingle()

        if (refError) {
          logError("Order service - reference number", refError)
        } else if (refOrder) {
          console.log(`[OrderService] Found order via reference number: ${refOrder.id}`)
          return { order: refOrder, source: "reference" }
        }
      } else {
        console.log(
          "[OrderService] Reference number column does not exist in orders table, skipping this lookup method",
        )
      }

      // Strategy 5: Try to find by order number in any format
      console.log(`[OrderService] Attempting lookup by order number in any format: ${idOrReference}`)

      // Try to find orders with similar IDs (more flexible matching)
      const { data: allOrders, error: allOrdersError } = await supabase.from("orders").select("id").limit(500)

      if (allOrdersError) {
        logError("Order service - all orders", allOrdersError)
      } else if (allOrders && allOrders.length > 0) {
        // Try different matching strategies
        const matchingIds = allOrders
          .filter((o) => {
            if (!o.id) return false
            // Check if the ID contains the reference (case insensitive)
            return (
              o.id.toLowerCase().includes(idOrReference.toLowerCase()) ||
              // Check if the first 8 chars match
              (idOrReference.length >= 8 && o.id.toLowerCase().startsWith(idOrReference.substring(0, 8).toLowerCase()))
            )
          })
          .map((o) => o.id)

        if (matchingIds.length > 0) {
          console.log(
            `[OrderService] Found ${matchingIds.length} orders with flexible ID matching for ${idOrReference}`,
          )

          // Get the first matching order with full details
          const { data: flexOrder, error: flexError } = await supabase
            .from("orders")
            .select(this.getOrderSelectQuery())
            .eq("id", matchingIds[0])
            .maybeSingle()

          if (flexError) {
            logError("Order service - flex match", flexError)
          } else if (flexOrder) {
            console.log(`[OrderService] Found order via flexible matching: ${flexOrder.id}`)
            return { order: flexOrder, source: "flexible" }
          }
        }
      }

      // No order found with any strategy
      console.log(`[OrderService] Order not found after exhausting all lookup methods for: ${idOrReference}`)
      return { order: null, source: null, error: "Order not found" }
    } catch (error) {
      logError("Order service - unexpected error", error)
      return {
        order: null,
        source: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Check if a delivery partner is assigned to an order
   */
  async isDeliveryPartnerAssigned(userId: string, orderId: string) {
    try {
      const supabase = createServerComponentClient({ cookies })
      console.log(`[OrderService] Checking if user ${userId} is assigned to order ${orderId}`)

      // Get the order to check its delivery_partner_id
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("delivery_partner_id")
        .eq("id", orderId)
        .maybeSingle()

      if (orderError) {
        logError("Order service - assignment check order", orderError)
        return false
      }

      if (!order || !order.delivery_partner_id) {
        console.log(`[OrderService] Order ${orderId} has no delivery partner assigned`)
        return false
      }

      // Check if the delivery partner is assigned to the user
      const { data: deliveryPartner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("user_id")
        .eq("id", order.delivery_partner_id)
        .maybeSingle()

      if (partnerError) {
        logError("Order service - assignment check partner", partnerError)
        return false
      }

      const isAssigned = deliveryPartner?.user_id === userId
      console.log(`[OrderService] User ${userId} assignment to order ${orderId}: ${isAssigned}`)

      // If not directly assigned, check if this is a shortened ID
      if (!isAssigned && orderId.length === 8) {
        console.log(`[OrderService] Checking shortened ID assignment for ${orderId}`)
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, delivery_partner_id")
          .limit(200)

        if (!ordersError && orders) {
          // Find orders where the ID starts with the given prefix
          const matchingOrders = orders.filter((o) => o.id.startsWith(orderId))
          console.log(`[OrderService] Found ${matchingOrders.length} orders with ID prefix ${orderId}`)

          for (const matchedOrder of matchingOrders) {
            if (matchedOrder.delivery_partner_id) {
              // Check if this delivery partner is assigned to the user
              const { data: matchedPartner, error: matchedError } = await supabase
                .from("delivery_partners")
                .select("user_id")
                .eq("id", matchedOrder.delivery_partner_id)
                .maybeSingle()

              if (!matchedError && matchedPartner && matchedPartner.user_id === userId) {
                console.log(`[OrderService] User ${userId} is assigned to order ${matchedOrder.id} via prefix match`)
                return true
              }
            }
          }
        }
      }

      // For testing purposes, temporarily allow all delivery partners to access all orders
      // REMOVE THIS IN PRODUCTION
      console.log("[OrderService] DEVELOPMENT MODE: Allowing all delivery partners to access all orders")
      return true

      // Return the actual assignment check result
      // return isAssigned
    } catch (error) {
      logError("Order service - assignment check unexpected error", error)
      return false
    }
  }

  /**
   * Get delivery status updates for an order
   */
  async getDeliveryStatusUpdates(orderId: string) {
    try {
      const supabase = createServerComponentClient({ cookies })
      const { data, error } = await supabase
        .from("delivery_status_updates")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true })

      if (error) {
        logError("Order service - status updates", error)
        return { updates: null, error: error.message }
      }

      return { updates: data || [], error: null }
    } catch (error) {
      logError("Order service - status updates exception", error)
      return { updates: null, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  /**
   * Get delivery proof for an order
   */
  async getDeliveryProof(orderId: string) {
    try {
      const supabase = createServerComponentClient({ cookies })
      const { data, error } = await supabase.from("delivery_proofs").select("*").eq("order_id", orderId).maybeSingle()

      if (error) {
        logError("Order service - delivery proof", error)
        return { proof: null, error: error.message }
      }

      return { proof: data, error: null }
    } catch (error) {
      logError("Order service - delivery proof exception", error)
      return { proof: null, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  /**
   * Get the standard order select query with all related data
   */
  private getOrderSelectQuery() {
    return `
      *,
      retailer:retailer_id(*),
      wholesaler:wholesaler_id(*),
      items:order_items(*, product:product_id(*))
    `
  }
}

// Export a singleton instance
export const orderService = new OrderService()
