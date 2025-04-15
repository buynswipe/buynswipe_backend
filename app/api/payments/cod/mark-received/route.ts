import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      return NextResponse.json({ error: "Only wholesalers and admins can mark payments as received" }, { status: 403 })
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
      return NextResponse.json({ error: "Order must be delivered before marking payment as received" }, { status: 400 })
    }

    // Check if payment method is COD
    if (order.payment_method !== "cod") {
      return NextResponse.json({ error: "This order is not a Cash on Delivery order" }, { status: 400 })
    }

    // Check if payment is already marked as paid
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Payment is already marked as paid" }, { status: 400 })
    }

    // Update order payment status directly
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
          error: `Failed to update order status: ${updateError.message}`,
          details: updateError,
        },
        { status: 500 },
      )
    }

    // Calculate transaction fee (2%)
    const transactionFee = Number.parseFloat((amount * 0.02).toFixed(2))

    // Try to create a transaction record using the transactions table first
    try {
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          order_id: orderId,
          amount,
          payment_method: "cod",
          status: "completed",
          transaction_fee: transactionFee,
        })
        .select()
        .single()

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError)

        // Try direct SQL insertion as fallback
        try {
          const { error: sqlError } = await supabase.sql`
            INSERT INTO transactions (order_id, amount, payment_method, status, transaction_fee)
            VALUES (${orderId}::uuid, ${amount}::decimal, 'cod', 'completed', ${transactionFee}::decimal);
          `

          if (sqlError) {
            console.error("SQL error creating transaction:", sqlError)
          } else {
            console.log("Transaction record created successfully via SQL")
          }
        } catch (sqlInsertError) {
          console.error("Critical error creating transaction via SQL:", sqlInsertError)
        }
      } else {
        console.log("Transaction record created successfully")
      }
    } catch (transactionError) {
      console.error("Error creating transaction record (non-critical):", transactionError)
    }

    console.log("Payment marked as received successfully")

    return NextResponse.json({
      success: true,
      message: "Payment marked as received successfully",
    })
  } catch (error: any) {
    // Catch any errors in the outer try block to ensure we always return JSON
    console.error("Critical error in COD payment API:", error)
    return NextResponse.json(
      {
        error: "A critical error occurred while processing the request",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
