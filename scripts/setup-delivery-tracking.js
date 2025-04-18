import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDeliveryTracking() {
  try {
    console.log("Setting up delivery tracking...")

    // Read and execute the SQL script
    const sqlScript = fs.readFileSync(path.join(process.cwd(), "scripts", "create-delivery-updates-table.sql"), "utf8")

    // Split the script by semicolons to execute each statement separately
    const statements = sqlScript
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", { sql: statement })
      if (error) {
        console.error("Error executing SQL statement:", error)
        console.error("Statement:", statement)
      }
    }

    console.log("Delivery updates table created successfully")

    // Create initial delivery updates for existing orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .not("status", "eq", "cancelled")

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return
    }

    console.log(`Found ${orders.length} orders to create initial delivery updates for`)

    // Create initial delivery updates
    const updates = orders.map((order) => ({
      order_id: order.id,
      status: order.status,
      notes: "Initial status",
      created_at: order.created_at,
    }))

    if (updates.length > 0) {
      const { error: insertError } = await supabase.from("delivery_updates").insert(updates)

      if (insertError) {
        console.error("Error creating initial delivery updates:", insertError)
      } else {
        console.log(`Created ${updates.length} initial delivery updates`)
      }
    }

    console.log("Delivery tracking setup complete!")
  } catch (error) {
    console.error("Error setting up delivery tracking:", error)
  }
}

setupDeliveryTracking()
