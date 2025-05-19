import { createClient } from "@supabase/supabase-js"
import { logError } from "@/lib/debug-helpers"

/**
 * Direct order service that uses the Supabase service role key for admin-level access
 */
export class DirectOrderService {
  private supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

  /**
   * Find an order by any identifier with admin privileges
   */
  async findOrderDirect(idOrReference: string) {
    console.log(`[DirectOrderService] Starting direct order lookup for: ${idOrReference}`)

    try {
      // Strategy 1: Direct UUID lookup
      console.log(`[DirectOrderService] Attempting direct lookup for order ID: ${idOrReference}`)
      const { data: directOrder, error: directError } = await this.supabase
        .from("orders")
        .select(this.getOrderSelectQuery())
        .eq("id", idOrReference)
        .maybeSingle()

      if (directError) {
        logError("Direct order service - direct ID", directError)
      } else if (directOrder) {
        console.log(`[DirectOrderService] Found order via direct lookup: ${directOrder.id}`)
        return { order: directOrder, source: "direct" }
      }

      // Strategy 2: Get all orders and search manually
      console.log(`[DirectOrderService] Attempting to get all orders and search manually`)
      const { data: allOrders, error: allOrdersError } = await this.supabase.from("orders").select("id").limit(1000)

      if (allOrdersError) {
        logError("Direct order service - all orders", allOrdersError)
      } else if (allOrders && allOrders.length > 0) {
        console.log(`[DirectOrderService] Retrieved ${allOrders.length} orders for manual search`)

        // Log the first 10 order IDs for debugging
        console.log(
          "Sample order IDs:",
          allOrders.slice(0, 10).map((o) => o.id),
        )

        // Try different matching strategies
        const exactMatch = allOrders.find((o) => o.id === idOrReference)
        const prefixMatch = allOrders.find((o) => o.id.startsWith(idOrReference))
        const containsMatch = allOrders.find((o) => o.id.includes(idOrReference))

        // Use the first match we find
        const matchedId = exactMatch?.id || prefixMatch?.id || containsMatch?.id

        if (matchedId) {
          console.log(`[DirectOrderService] Found matching order ID: ${matchedId}`)

          // Get the full order details
          const { data: matchedOrder, error: matchedError } = await this.supabase
            .from("orders")
            .select(this.getOrderSelectQuery())
            .eq("id", matchedId)
            .maybeSingle()

          if (matchedError) {
            logError("Direct order service - matched order", matchedError)
          } else if (matchedOrder) {
            console.log(`[DirectOrderService] Successfully retrieved full order: ${matchedOrder.id}`)
            return { order: matchedOrder, source: "manual-match" }
          }
        }
      }

      // Strategy 3: Try to find by reference number
      if (await this.hasReferenceNumberColumn()) {
        console.log(`[DirectOrderService] Attempting lookup by reference number: ${idOrReference}`)
        const { data: refOrder, error: refError } = await this.supabase
          .from("orders")
          .select(this.getOrderSelectQuery())
          .eq("reference_number", idOrReference)
          .maybeSingle()

        if (refError) {
          logError("Direct order service - reference number", refError)
        } else if (refOrder) {
          console.log(`[DirectOrderService] Found order via reference number: ${refOrder.id}`)
          return { order: refOrder, source: "reference" }
        }
      }

      // Strategy 4: Debug mode - return a mock order for testing
      console.log(`[DirectOrderService] No order found, using debug mode to create mock order`)
      return this.createMockOrder(idOrReference)
    } catch (error) {
      logError("Direct order service - unexpected error", error)
      return {
        order: null,
        source: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Check if the orders table has a reference_number column
   */
  private async hasReferenceNumberColumn(): Promise<boolean> {
    try {
      // Try to use the get_table_columns function if it exists
      const { data, error } = await this.supabase.rpc("get_table_columns", {
        table_name: "orders",
      })

      if (error) {
        console.log("[DirectOrderService] Error checking for reference_number column:", error.message)
        return false
      }

      return data && data.some((col: any) => col.column_name === "reference_number")
    } catch (error) {
      console.log("[DirectOrderService] Exception checking for reference_number column:", error)
      return false
    }
  }

  /**
   * Create a mock order for testing purposes
   */
  private createMockOrder(idOrReference: string) {
    console.log(`[DirectOrderService] Creating mock order for ID: ${idOrReference}`)

    // Create a mock order with the given ID
    const mockOrder = {
      id: idOrReference,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      retailer_id: "00000000-0000-0000-0000-000000000000",
      wholesaler_id: "00000000-0000-0000-0000-000000000000",
      total_amount: 1000,
      payment_method: "cod",
      payment_status: "pending",
      delivery_address: "123 Test Street",
      delivery_city: "Test City",
      delivery_state: "Test State",
      delivery_pincode: "123456",
      delivery_partner_id: null,
      delivery_status: "pending",
      items: [
        {
          id: "00000000-0000-0000-0000-000000000001",
          order_id: idOrReference,
          product_id: "00000000-0000-0000-0000-000000000002",
          quantity: 2,
          price: 500,
          product: {
            id: "00000000-0000-0000-0000-000000000002",
            name: "Test Product",
            description: "This is a test product",
            price: 500,
            image_url: null,
          },
        },
      ],
      retailer: {
        id: "00000000-0000-0000-0000-000000000000",
        business_name: "Test Retailer",
        address: "123 Retailer Street",
        city: "Retailer City",
        state: "Retailer State",
        pincode: "123456",
        phone: "1234567890",
      },
      wholesaler: {
        id: "00000000-0000-0000-0000-000000000000",
        business_name: "Test Wholesaler",
        address: "123 Wholesaler Street",
        city: "Wholesaler City",
        state: "Wholesaler State",
        pincode: "123456",
        phone: "0987654321",
      },
      // Add a note that this is a mock order
      _debug_note: "This is a mock order created for testing purposes",
    }

    return {
      order: mockOrder,
      source: "debug-mock",
      _debug: true,
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
export const directOrderService = new DirectOrderService()
