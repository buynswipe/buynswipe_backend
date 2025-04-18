import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    // Check for authorization
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    // Verify the setup token
    if (!process.env.SETUP_SECRET_TOKEN || token !== process.env.SETUP_SECRET_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check if they're an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    console.log("Starting delivery tracking setup...")

    // Read the SQL script
    const sqlFilePath = path.join(process.cwd(), "scripts", "create-delivery-updates-table.sql")

    // Check if the file exists
    if (!fs.existsSync(sqlFilePath)) {
      return NextResponse.json({ error: "SQL script not found" }, { status: 500 })
    }

    const sqlScript = fs.readFileSync(sqlFilePath, "utf8")

    // Split the script by semicolons to execute each statement separately
    const statements = sqlScript
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    console.log(`Executing ${statements.length} SQL statements...`)

    // Execute each SQL statement
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql: statement })
        if (error) {
          console.error("Error executing SQL statement:", error)
        }
      } catch (error) {
        console.error("Error executing SQL statement:", error)
        // Continue with other statements even if one fails
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
      return NextResponse.json({ error: "Error fetching orders", details: ordersError }, { status: 500 })
    }

    console.log(`Found ${orders?.length || 0} orders to create initial delivery updates for`)

    // Check if there are any orders to process
    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Delivery tracking setup complete. No orders to process.",
      })
    }

    // Create initial delivery updates in batches to avoid payload size limits
    const BATCH_SIZE = 100
    let processedCount = 0
    let errorCount = 0

    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
      const batch = orders.slice(i, i + BATCH_SIZE)

      const updates = batch.map((order) => ({
        order_id: order.id,
        status: order.status,
        notes: "Initial status",
        created_at: order.created_at,
      }))

      const { error: insertError } = await supabase.from("delivery_updates").insert(updates)

      if (insertError) {
        console.error(`Error creating batch ${i / BATCH_SIZE + 1}:`, insertError)
        errorCount++
      } else {
        processedCount += batch.length
        console.log(`Processed batch ${i / BATCH_SIZE + 1}: ${batch.length} orders`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Delivery tracking setup complete",
      ordersProcessed: processedCount,
      errorBatches: errorCount,
    })
  } catch (error) {
    console.error("Error setting up delivery tracking:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
