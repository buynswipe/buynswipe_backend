import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { logError } from "@/lib/debug-helpers"

/**
 * Comprehensive order lookup service with multiple fallback strategies
 */
export async function findOrder(idOrReference: string) {
  console.log(`[SERVER] Starting order lookup for: ${idOrReference}`)
  const supabase = createServerComponentClient({ cookies })

  try {
    // Strategy 1: Direct UUID lookup
    console.log(`Attempting direct lookup for order ID: ${idOrReference}`)
    const { data: directOrder, error: directError } = await supabase
      .from("orders")
      .select(
        `
        *,
        retailer:retailer_id(*),
        wholesaler:wholesaler_id(*),
        items:order_items(*, product:product_id(*))
      `,
      )
      .eq("id", idOrReference)
      .maybeSingle()

    if (directError) {
      logError("Order lookup - direct ID", directError)
    } else if (directOrder) {
      console.log(`Found order via direct lookup: ${directOrder.id}`)
      return { order: directOrder, source: "direct" }
    }

    // Strategy 2: Lookup by shortened ID (first 8 chars)
    if (idOrReference.length === 8) {
      console.log(`Attempting lookup for ID prefix: ${idOrReference}`)

      // Get a limited set of order IDs
      const { data: orderIds, error: idsError } = await supabase.from("orders").select("id").limit(200)

      if (idsError) {
        logError("Order lookup - ID prefix", idsError)
      } else if (orderIds && orderIds.length > 0) {
        // Find matching IDs (case insensitive)
        const matchingIds = orderIds
          .filter((o) => o.id && o.id.toLowerCase().startsWith(idOrReference.toLowerCase()))
          .map((o) => o.id)

        if (matchingIds.length > 0) {
          console.log(`Found ${matchingIds.length} orders with ID prefix ${idOrReference}`)

          // Get the first matching order with full details
          const { data: prefixOrder, error: orderError } = await supabase
            .from("orders")
            .select(
              `
              *,
              retailer:retailer_id(*),
              wholesaler:wholesaler_id(*),
              items:order_items(*, product:product_id(*))
            `,
            )
            .eq("id", matchingIds[0])
            .maybeSingle()

          if (orderError) {
            logError("Order lookup - matched order", orderError)
          } else if (prefixOrder) {
            console.log(`Found order via ID prefix: ${prefixOrder.id}`)
            return { order: prefixOrder, source: "prefix" }
          }
        }
      }
    }

    // Strategy 3: Check if this is a notification reference
    console.log(`Checking if ${idOrReference} is a notification ID`)
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("related_entity_id, data")
      .eq("id", idOrReference)
      .maybeSingle()

    if (notificationError) {
      logError("Order lookup - notification", notificationError)
    } else if (notification && notification.related_entity_id) {
      // Get the order using the notification's related_entity_id
      const { data: notifOrder, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          retailer:retailer_id(*),
          wholesaler:wholesaler_id(*),
          items:order_items(*, product:product_id(*))
        `,
        )
        .eq("id", notification.related_entity_id)
        .maybeSingle()

      if (orderError) {
        logError("Order lookup - related order", orderError)
      } else if (notifOrder) {
        console.log(`Found order via notification reference: ${notifOrder.id}`)
        return { order: notifOrder, source: "notification" }
      }
    }

    // Strategy 4: Try to find by reference number
    console.log(`Attempting lookup by reference number: ${idOrReference}`)

    // Check if the reference_number column exists
    const { data: columns, error: columnsError } = await supabase.rpc("get_table_columns", {
      table_name: "orders",
    })

    if (columnsError) {
      logError("Order lookup - get columns", columnsError)
      // Continue with the query anyway, it will fail if the column doesn't exist
    }

    // Check if reference_number column exists
    const hasReferenceNumber = columns && columns.some((col: any) => col.column_name === "reference_number")

    if (hasReferenceNumber) {
      const { data: refOrder, error: refError } = await supabase
        .from("orders")
        .select(
          `
          *,
          retailer:retailer_id(*),
          wholesaler:wholesaler_id(*),
          items:order_items(*, product:product_id(*))
        `,
        )
        .eq("reference_number", idOrReference)
        .maybeSingle()

      if (refError) {
        logError("Order lookup - reference number", refError)
      } else if (refOrder) {
        console.log(`Found order via reference number: ${refOrder.id}`)
        return { order: refOrder, source: "reference" }
      }
    } else {
      console.log("Reference number column does not exist in orders table, skipping this lookup method")
    }

    // No order found with any strategy
    console.log(`Order not found after exhausting all lookup methods for: ${idOrReference}`)
    return { order: null, source: null, error: "Order not found" }
  } catch (error) {
    logError("Order lookup - unexpected error", error)
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
export async function isDeliveryPartnerAssigned(userId: string, orderId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Get the order to check its delivery_partner_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("delivery_partner_id")
      .eq("id", orderId)
      .maybeSingle()

    if (orderError) {
      logError("Order assignment check - order", orderError)
      return false
    }

    if (!order || !order.delivery_partner_id) {
      return false
    }

    // Check if the delivery partner is assigned to the user
    const { data: deliveryPartner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("user_id")
      .eq("id", order.delivery_partner_id)
      .maybeSingle()

    if (partnerError) {
      logError("Order assignment check - partner", partnerError)
      return false
    }

    // Also check if the order ID matches the shortened ID format
    if (orderId.length === 8) {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, delivery_partner_id")
        .limit(100)

      if (!ordersError && orders) {
        // Find orders where the ID starts with the given prefix
        const matchingOrders = orders.filter((o) => o.id.startsWith(orderId))

        for (const matchedOrder of matchingOrders) {
          if (matchedOrder.delivery_partner_id) {
            // Check if this delivery partner is assigned to the user
            const { data: matchedPartner, error: matchedError } = await supabase
              .from("delivery_partners")
              .select("user_id")
              .eq("id", matchedOrder.delivery_partner_id)
              .maybeSingle()

            if (!matchedError && matchedPartner && matchedPartner.user_id === userId) {
              return true
            }
          }
        }
      }
    }

    return deliveryPartner?.user_id === userId
  } catch (error) {
    logError("Order assignment check - unexpected error", error)
    return false
  }
}
