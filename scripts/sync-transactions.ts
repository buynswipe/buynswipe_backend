import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables")
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function syncTransactions() {
  console.log("Starting transaction sync from orders...")

  try {
    // Check if transactions table exists
    const { error: checkError } = await supabase.from("transactions").select("id").limit(1).maybeSingle()

    if (checkError && checkError.message.includes('relation "transactions" does not exist')) {
      console.error("Transactions table does not exist. Please run create-transactions-table script first.")
      process.exit(1)
    }

    // Get all orders with payment_status = "paid"
    const { data: paidOrders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        retailer_id,
        wholesaler_id,
        payment_method,
        total_amount
      `)
      .eq("payment_status", "paid")

    if (ordersError) {
      console.error("Error fetching paid orders:", ordersError)
      throw ordersError
    }

    console.log(`Found ${paidOrders.length} paid orders to sync`)

    // For each paid order, check if a transaction exists
    let createdCount = 0
    let skippedCount = 0

    for (const order of paidOrders) {
      // Check if transaction already exists for this order
      const { data: existingTransaction, error: checkTxError } = await supabase
        .from("transactions")
        .select("id")
        .eq("order_id", order.id)
        .maybeSingle()

      if (checkTxError && !checkTxError.message.includes("No rows found")) {
        console.error(`Error checking transaction for order ${order.id}:`, checkTxError)
        continue
      }

      if (existingTransaction) {
        console.log(`Transaction already exists for order ${order.id}, skipping`)
        skippedCount++
        continue
      }

      // Calculate transaction fee (2%)
      const transactionFee = Number.parseFloat((order.total_amount * 0.02).toFixed(2))

      // Create transaction record
      const { error: createError } = await supabase.from("transactions").insert({
        order_id: order.id,
        amount: order.total_amount,
        payment_method: order.payment_method,
        status: "completed",
        transaction_fee: transactionFee,
        created_at: order.created_at, // Use the same creation date as the order
      })

      if (createError) {
        console.error(`Error creating transaction for order ${order.id}:`, createError)
        continue
      }

      console.log(`Created transaction for order ${order.id}`)
      createdCount++
    }

    console.log(`Sync complete: Created ${createdCount} transactions, skipped ${skippedCount} existing transactions`)
    return true
  } catch (error) {
    console.error("Error syncing transactions:", error)
    throw error
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  syncTransactions()
    .then(() => {
      console.log("Script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}
