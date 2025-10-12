import { createClient } from "@supabase/supabase-js"

async function fixDeliveryAssignments() {
  console.log("Starting delivery assignment fix...")

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })

    // 1. Get all orders with delivery partner assignments
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, delivery_partner_id, status")
      .not("delivery_partner_id", "is", null)

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`)
    }

    console.log(`Found ${orders.length} orders with delivery partner assignments`)

    // 2. Process each order
    let fixedCount = 0
    let errorCount = 0

    for (const order of orders) {
      try {
        // Check if the order status is appropriate for delivery
        if (!["confirmed", "dispatched", "in_transit", "out_for_delivery"].includes(order.status)) {
          console.log(`Order ${order.id} has status ${order.status}, updating to confirmed`)

          // Update order status to at least confirmed
          const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "confirmed" })
            .eq("id", order.id)

          if (updateError) {
            throw new Error(`Error updating order status: ${updateError.message}`)
          }

          fixedCount++
        }
      } catch (err: any) {
        console.error(`Error processing order ${order.id}:`, err.message)
        errorCount++
      }
    }

    console.log(`Fix complete. Fixed ${fixedCount} orders. Errors: ${errorCount}`)
    return { success: true, fixedCount, errorCount }
  } catch (error: any) {
    console.error("Error in fixDeliveryAssignments:", error)
    return { success: false, error: error.message }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  fixDeliveryAssignments()
    .then((result) => {
      console.log("Result:", result)
      process.exit(0)
    })
    .catch((error) => {
      console.error("Fatal error:", error)
      process.exit(1)
    })
}

export default fixDeliveryAssignments
