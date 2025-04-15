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
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { orderId, amount } = await request.json()

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
    if (order.retailer_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized - You are not the retailer for this order" }, { status: 403 })
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

    // Update order with transaction ID for reference
    await supabase
      .from("orders")
      .update({
        payment_reference: txnId,
      })
      .eq("id", orderId)

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
