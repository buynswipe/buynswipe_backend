import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDeliveryTracking() {
  try {
    console.log("Testing delivery tracking system...")

    // 1. Check if the delivery_updates table exists
    console.log("\n1. Checking if delivery_updates table exists...")
    const { data: tableExists, error: tableError } = await supabase.from("delivery_updates").select("id").limit(1)

    if (tableError) {
      console.error("Error checking delivery_updates table:", tableError)
      return
    }

    console.log("✅ delivery_updates table exists and is accessible")

    // 2. Get a sample order to test with
    console.log("\n2. Finding a sample order to test with...")
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, delivery_partner_id")
      .in("status", ["confirmed", "dispatched"])
      .limit(1)

    if (ordersError || !orders || orders.length === 0) {
      console.error("Error finding a sample order:", ordersError || "No suitable orders found")
      return
    }

    const testOrder = orders[0]
    console.log(`✅ Found test order: ${testOrder.id} with status: ${testOrder.status}`)

    // 3. Check if the order has delivery updates
    console.log("\n3. Checking if the order has delivery updates...")
    const { data: updates, error: updatesError } = await supabase
      .from("delivery_updates")
      .select("*")
      .eq("order_id", testOrder.id)
      .order("created_at", { ascending: false })

    if (updatesError) {
      console.error("Error checking delivery updates:", updatesError)
      return
    }

    console.log(`✅ Found ${updates.length} delivery updates for the order`)

    if (updates.length > 0) {
      console.log("Latest update:", updates[0])
    }

    // 4. Create a new delivery update
    console.log("\n4. Creating a new delivery update...")

    // Determine the next status
    const statusOrder = ["confirmed", "dispatched", "in_transit", "out_for_delivery", "delivered"]
    const currentStatusIndex = statusOrder.indexOf(testOrder.status)
    const nextStatus =
      currentStatusIndex < statusOrder.length - 1 ? statusOrder[currentStatusIndex + 1] : statusOrder[0] // Loop back to the first status if at the end

    const { data: newUpdate, error: createError } = await supabase
      .from("delivery_updates")
      .insert({
        order_id: testOrder.id,
        status: nextStatus,
        location: "Test Location",
        notes: "This is a test update created by the test script",
      })
      .select()

    if (createError) {
      console.error("Error creating delivery update:", createError)
      return
    }

    console.log(`✅ Created new delivery update with status: ${nextStatus}`)

    // 5. Update the order status
    console.log("\n5. Updating the order status...")
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", testOrder.id)

    if (orderUpdateError) {
      console.error("Error updating order status:", orderUpdateError)
      return
    }

    console.log(`✅ Updated order status to: ${nextStatus}`)

    // 6. Verify the update was created
    console.log("\n6. Verifying the update was created...")
    const { data: verifyUpdates, error: verifyError } = await supabase
      .from("delivery_updates")
      .select("*")
      .eq("order_id", testOrder.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (verifyError || !verifyUpdates || verifyUpdates.length === 0) {
      console.error("Error verifying update:", verifyError || "No updates found")
      return
    }

    console.log("✅ Verified the update was created:")
    console.log(verifyUpdates[0])

    console.log("\n✅ All tests passed! The delivery tracking system is working properly.")
  } catch (error) {
    console.error("An error occurred during testing:", error)
  }
}

testDeliveryTracking()
