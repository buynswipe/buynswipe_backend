import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { createPayment, validatePayUConfig } from "@/lib/payu-client"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Validate PayU configuration
    try {
      validatePayUConfig()
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "PayU configuration error" }, { status: 500 })
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const orderId = typeof body.orderId === "string" ? body.orderId : ""
    const requestedAmount = Number(body.amount)

    if (!orderId || !Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json({ error: "A valid orderId and positive amount are required" }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:profiles!retailer_id(*)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is the retailer for this order
    if (order.retailer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orderAmount = Number(order.total_amount)
    if (!Number.isFinite(orderAmount) || orderAmount <= 0 || requestedAmount !== orderAmount) {
      return NextResponse.json({ error: "Payment amount does not match the order" }, { status: 400 })
    }

    // Check if order is already paid
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "This order has already been paid" }, { status: 400 })
    }

    // Generate a unique transaction ID
    const txnId = `RB-${uuidv4().substring(0, 8)}-${Date.now()}`

    // Create payment request
    const paymentRequest = await createPayment({
      txnId,
      amount: order.total_amount,
      productInfo: `Order #${orderId.substring(0, 8)}`,
      firstName: order.retailer.business_name,
      email: order.retailer.email,
      phone: order.retailer.phone,
      udf1: orderId, // Store order ID for reference
    })

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_reference: txnId })
      .eq("id", orderId)
      .eq("payment_status", "pending")

    if (updateError) {
      console.error("PayU payment reference update failed", updateError)
      return NextResponse.json({ error: "Unable to initialize payment" }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentRequest.url,
      params: paymentRequest.params,
      txnId,
    })
  } catch (error: any) {
    console.error("Error creating PayU payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to create payment",
      },
      { status: 500 },
    )
  }
}
