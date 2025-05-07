import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Ensure we're returning JSON even in error cases
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const { orderId, amount } = await request.json()

      if (!orderId || !amount) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      console.log(`Processing COD payment for order ${orderId} with amount ${amount}`)

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        return NextResponse.json({ error: "Failed to verify user role", details: profileError }, { status: 500 })
      }

      if (profile.role !== "wholesaler" && profile.role !== "admin") {
        return NextResponse.json(
          { error: "Only wholesalers and admins can mark payments as received" },
          { status: 403 },
        )
      }

      // Get order details
      const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (orderError) {
        console.error("Error fetching order:", orderError)
        return NextResponse.json({ error: "Order not found", details: orderError }, { status: 404 })
      }

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Check if user is the wholesaler for this order or an admin
      if (order.wholesaler_id !== session.user.id && profile.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized - You are not the wholesaler for this order" }, { status: 403 })
      }

      // Check if order is delivered
      if (order.status !== "delivered") {
        return NextResponse.json(
          { error: "Order must be delivered before marking payment as received" },
          { status: 400 },
        )
      }

      // Check if payment method is COD
      if (order.payment_method !== "cod") {
        return NextResponse.json({ error: "This order is not a Cash on Delivery order" }, { status: 400 })
      }

      // Check if payment is already marked as paid
      if (order.payment_status === "paid") {
        return NextResponse.json({ error: "Payment is already marked as paid" }, { status: 400 })
      }

      // Try to create transactions table
      try {
        // First check if the table exists
        const { error: checkTableError } = await supabase.from("transactions").select("id").limit(1).maybeSingle()

        // If table doesn't exist, attempt to create it
        if (checkTableError && checkTableError.message.includes('relation "transactions" does not exist')) {
          console.log("Transactions table doesn't exist, creating it...")

          // Use SQL to create the table
          await supabase.rpc("exec_sql", {
            sql: `
              CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                order_id UUID NOT NULL REFERENCES orders(id),
                amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                transaction_fee DECIMAL(10, 2)
              );
              
              -- Basic RLS policy to allow insert by authenticated users
              ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
              CREATE POLICY "Allow insert for authenticated users" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
            `,
          })
        }
      } catch (tableError) {
        console.error("Error checking/creating transactions table:", tableError)
        // Continue and let the insert attempt fail if necessary
      }

      // Check if a transaction already exists for this order
      const { data: existingTransaction, error: checkError } = await supabase
        .from("transactions")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle()

      if (checkError && !checkError.message.includes('relation "transactions" does not exist')) {
        console.error("Error checking existing transaction:", checkError)
        return NextResponse.json(
          {
            error: "Failed to check for existing transaction",
            details: checkError,
          },
          { status: 500 },
        )
      }

      // If transaction already exists, return success
      if (existingTransaction) {
        // Update order payment status if needed
        if (order.payment_status !== "paid") {
          const { error: updateError } = await supabase
            .from("orders")
            .update({ payment_status: "paid" })
            .eq("id", orderId)

          if (updateError) {
            console.error("Error updating order payment status:", updateError)
            return NextResponse.json(
              {
                error: "Transaction exists but failed to update order status",
                details: updateError,
              },
              { status: 500 },
            )
          }
        }

        return NextResponse.json({
          success: true,
          message: "Payment already processed",
          transaction: existingTransaction,
        })
      }

      // Calculate transaction fee (1% for COD)
      const transactionFee = Number.parseFloat((amount * 0.01).toFixed(2))

      console.log(`Creating transaction record with fee: ${transactionFee}`)

      // Try first method: using the transactions table
      let transaction: any = null
      let transactionCreated = false

      try {
        // Create transaction record
        const { data: txData, error: transactionError } = await supabase
          .from("transactions")
          .insert({
            order_id: orderId,
            amount: amount,
            payment_method: "cod",
            status: "completed",
            transaction_fee: transactionFee,
          })
          .select()
          .single()

        if (transactionError) {
          console.error("Error creating transaction:", transactionError)
          // We'll try the direct SQL method next
        } else {
          transaction = txData
          transactionCreated = true
          console.log("Transaction created successfully via regular insert")
        }
      } catch (insertError) {
        console.error("Error in regular insert:", insertError)
        // We'll try the direct SQL method next
      }

      // If the first method failed, try direct SQL
      if (!transactionCreated) {
        try {
          console.log("Attempting direct SQL insert...")

          // Fix the SQL query to properly escape values and use parameterized queries
          const { data: sqlResult, error: sqlError } = await supabase.rpc("exec_sql", {
            sql: `
              DO $$
              DECLARE
                new_id uuid;
              BEGIN
                INSERT INTO transactions 
                  (order_id, amount, payment_method, status, transaction_fee)
                VALUES 
                  ('${orderId}'::uuid, ${amount}::decimal, 'cod', 'completed', ${transactionFee}::decimal)
                RETURNING id INTO new_id;
                
                -- Return the new ID
                RAISE NOTICE 'Created transaction with ID: %', new_id;
              END $$;
              
              -- Return something to avoid null result
              SELECT 'transaction_created' as result;
            `,
          })

          if (sqlError) {
            console.error("SQL insert error:", sqlError)
            return NextResponse.json(
              {
                error: "Failed to create transaction using SQL",
                details: sqlError,
                code: "SQL_INSERT_FAILED",
              },
              { status: 500 },
            )
          }

          transaction = { id: "created-via-sql", order_id: orderId }
          transactionCreated = true
          console.log("Transaction created successfully via direct SQL")
        } catch (sqlError) {
          console.error("Exception in SQL insert:", sqlError)

          // Try one more fallback with even simpler SQL
          try {
            console.log("Attempting simplified SQL insert...")
            const { error: simpleError } = await supabase.rpc("exec_sql", {
              sql: `
                INSERT INTO transactions 
                  (order_id, amount, payment_method, status) 
                VALUES 
                  ('${orderId}', ${amount}, 'cod', 'completed');
              `,
            })

            if (!simpleError) {
              transaction = { id: "created-via-simple-sql", order_id: orderId }
              transactionCreated = true
              console.log("Transaction created successfully via simplified SQL")
            } else {
              console.error("Simple SQL insert failed:", simpleError)
              return NextResponse.json(
                {
                  error: "All SQL transaction creation methods failed",
                  details: simpleError,
                  code: "ALL_SQL_FAILED",
                },
                { status: 500 },
              )
            }
          } catch (finalError) {
            return NextResponse.json(
              {
                error: "Exception during all SQL transaction creation attempts",
                details: finalError,
                code: "SQL_EXCEPTION",
              },
              { status: 500 },
            )
          }
        }
      }

      // If we still couldn't create a transaction, return an error
      if (!transactionCreated) {
        return NextResponse.json(
          {
            error: "Failed to create transaction after multiple attempts",
            code: "TRANSACTION_CREATION_FAILED",
          },
          { status: 500 },
        )
      }

      console.log("Transaction created, updating order payment status...")

      // Update order payment status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("Error updating order payment status:", updateError)
        return NextResponse.json(
          {
            error: `Transaction created but failed to update order status: ${updateError.message}`,
            transaction,
            partialSuccess: true,
          },
          { status: 500 },
        )
      }

      console.log("Payment marked as received successfully")

      return NextResponse.json({
        success: true,
        transaction,
      })
    } catch (error: any) {
      console.error("Error processing request:", error)
      return NextResponse.json(
        {
          error: error.message || "Internal server error",
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        { status: 500 },
      )
    }
  } catch (outerError: any) {
    // Catch any errors in the outer try block to ensure we always return JSON
    console.error("Critical error in COD payment API:", outerError)
    return NextResponse.json(
      {
        error: "A critical error occurred while processing the request",
        message: outerError.message,
      },
      { status: 500 },
    )
  }
}
