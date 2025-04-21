import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { generateUpiLink, validatePayUConfig } from "@/lib/payu-client"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Validate PayU configuration
    try {
      validatePayUConfig()
    } catch (error: any) {
      console.error("PayU configuration error:", error.message)
      return NextResponse.json({ error: error.message || "PayU configuration error" }, { status: 500 })
    }

    // Get authenticated user
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

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Missing required field: orderId" }, { status: 400 })
    }

    console.log("Processing UPI payment for order:", orderId)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        retailer:profiles!retailer_id(*)
      `)
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ error: "Order not found: " + orderError.message }, { status: 404 })
    }

    if (!order) {
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

    console.log("Generated transaction ID:", txnId)

    // For testing/development, create a mock UPI payment response
    // This helps bypass PayU API issues during development
    if (process.env.NODE_ENV !== "production") {
      console.log("Using mock UPI payment data for development")

      // Update order with transaction ID for reference
      await supabase
        .from("orders")
        .update({
          payment_reference: txnId,
          payment_method: "upi",
        })
        .eq("id", orderId)

      // Return mock data
      return NextResponse.json({
        success: true,
        upiUri: `upi://pay?pa=test@payu&pn=RetailBandhu&am=${order.total_amount}&tr=${txnId}&tn=Order%20Payment`,
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=test@payu",
        txnId: txnId,
        timeout: 240,
      })
    }

    // Generate UPI payment link
    try {
      console.log("Generating UPI payment link with PayU")

      const upiPayment = await generateUpiLink({
        txnId,
        amount: order.total_amount,
        productInfo: `Order #${orderId.substring(0, 8)}`,
        firstName: order.retailer.business_name || "Customer",
        email: order.retailer.email || "customer@example.com",
        phone: order.retailer.phone || "9999999999",
        orderId,
      })

      // Update order with transaction ID for reference
      await supabase
        .from("orders")
        .update({
          payment_reference: txnId,
          payment_method: "upi",
        })
        .eq("id", orderId)

      console.log("UPI payment link generated successfully")

      return NextResponse.json({
        success: true,
        upiUri: upiPayment.upiUri,
        qrCode: upiPayment.qrCode,
        txnId: upiPayment.txnId,
        timeout: upiPayment.timeout,
      })
    } catch (error: any) {
      console.error("Error generating UPI payment link:", error)
      return NextResponse.json(
        {
          error: error.message || "Failed to generate UPI payment link",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected error creating UPI payment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to create UPI payment",
      },
      { status: 500 },
    )
  }
}
