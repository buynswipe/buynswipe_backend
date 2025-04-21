import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { checkPaymentStatus } from "@/lib/payu-client"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { txnId, orderId } = await request.json()

    if (!txnId || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is associated with this order
    if (order.retailer_id !== session.user.id && order.wholesaler_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized - You are not associated with this order" }, { status: 403 })
    }

    // Check if payment reference matches
    if (order.payment_reference !== txnId) {
      return NextResponse.json({ error: "Transaction ID does not match order records" }, { status: 400 })
    }

    // If order is already marked as paid, return success
    if (order.payment_status === "paid") {
      return NextResponse.json({
        status: "success",
        message: "Payment has been completed successfully",
        orderStatus: order.payment_status,
      })
    }

    // Check payment status with PayU
    const paymentStatus = await checkPaymentStatus(txnId)

    // If payment is successful, update order status
    if (paymentStatus.status === "success") {
      // Update order payment status
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
        })
        .eq("id", orderId)

      // Create transaction record if it doesn't exist
      const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle()

      if (!existingTransaction) {
        await supabase.from("transactions").insert({
          order_id: orderId,
          amount: order.total_amount,
          payment_method: "upi",
          status: "completed",
          transaction_fee: order.total_amount * 0.02, // 2% fee
          external_reference: paymentStatus.transactionId || txnId,
        })
      }
    }

    return NextResponse.json({
      status: paymentStatus.status,
      message: paymentStatus.message,
      orderStatus: order.payment_status,
    })
  } catch (error: any) {
    console.error("Error checking payment status:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to check payment status",
      },
      { status: 500 },
    )
  }
}
