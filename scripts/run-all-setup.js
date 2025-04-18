import { createClient } from "@supabase/supabase-js"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runAllSetup() {
  try {
    console.log("Running all setup scripts...")

    // 1. Setup delivery tracking
    console.log("\n1. Setting up delivery tracking...")
    await execAsync("node scripts/setup-delivery-tracking.js")

    // 2. Setup notifications
    console.log("\n2. Setting up notifications...")
    await execAsync("node scripts/setup-notifications.js")

    // 3. Create test data
    console.log("\n3. Creating test data...")
    await createTestData()

    console.log("\n✅ All setup processes completed successfully!")
  } catch (error) {
    console.error("Error running setup scripts:", error)
  }
}

async function createTestData() {
  try {
    // Create test delivery updates for existing orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status")
      .in("status", ["dispatched", "in_transit", "out_for_delivery", "delivered"])

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return
    }

    console.log(`Found ${orders?.length || 0} orders to create test delivery updates for`)

    // Create delivery updates for each order
    for (const order of orders || []) {
      // Check if updates already exist
      const { data: existingUpdates, error: checkError } = await supabase
        .from("delivery_updates")
        .select("id")
        .eq("order_id", order.id)
        .limit(1)

      if (checkError) {
        console.error(`Error checking updates for order ${order.id}:`, checkError)
        continue
      }

      // Skip if updates already exist
      if (existingUpdates && existingUpdates.length > 0) {
        console.log(`Order ${order.id} already has updates, skipping...`)
        continue
      }

      // Create initial update
      const { error: createError } = await supabase.from("delivery_updates").insert({
        order_id: order.id,
        status: order.status,
        notes: "Initial status",
      })

      if (createError) {
        console.error(`Error creating update for order ${order.id}:`, createError)
      } else {
        console.log(`Created initial update for order ${order.id}`)
      }
    }

    console.log("Test data created successfully")
  } catch (error) {
    console.error("Error creating test data:", error)
  }
}

runAllSetup()
