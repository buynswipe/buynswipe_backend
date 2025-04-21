import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    // Get order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }
    // Check if user is the retailer for this order
    if (order.retailer_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Calculate transaction fee (2%)
    const transactionFee = Number.parseFloat((amount * 0.02).toFixed(2))

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        order_id: orderId,
        amount,
        payment_method: "upi",
        status: "completed", // In a real app, this would be pending until confirmed
        transaction_fee: transactionFee,
      })
      .select()
      .single()

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError)

      // Try direct SQL insertion as fallback
      try {
        const { error: sqlError } = await supabase.sql`
          INSERT INTO transactions (order_id, amount, payment_method, status, transaction_fee)
          VALUES (${orderId}::uuid, ${amount}::decimal, 'upi', 'completed', ${transactionFee}::decimal);
        `

        if (sqlError) {
          console.error("SQL error creating transaction:", sqlError)
          return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
        }
      } catch (sqlInsertError) {
        console.error("Critical error creating transaction:", sqlInsertError)
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
      }
    }

    // Update order payment status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
      })
      .eq("id", orderId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
