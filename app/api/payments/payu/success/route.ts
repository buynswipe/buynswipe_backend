import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { verifyHash } from "@/lib/payu-client"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const params: Record<string, string> = {}

  // Convert formData to params object
  for (const [key, value] of formData.entries()) {
    params[key] = value.toString()
  }

  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Error getting session:", sessionError)
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 })
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
  }

  // Verify hash to ensure the response is from PayU
  const isValidHash = verifyHash(params)
  if (!isValidHash) {
    return NextResponse.redirect(new URL(`/payment-error?error=Invalid response hash`, request.url))
  }

  try {
    // Get order ID from udf1
    const orderId = params.udf1

    if (!orderId) {
      return NextResponse.redirect(new URL(`/payment-error?error=Order ID not found`, request.url))
    }

    // Update order payment status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_reference: params.txnid,
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order payment status:", updateError)
      return NextResponse.redirect(new URL(`/payment-error?error=Failed to update order status`, request.url))
    }

    // Create transaction record
    const { error: transactionError } = await supabase.from("transactions").insert({
      order_id: orderId,
      amount: Number.parseFloat(params.amount),
      payment_method: "upi",
      status: "completed",
      transaction_fee: Number.parseFloat(params.amount) * 0.02, // 2% fee
      external_reference: params.mihpayid || params.txnid,
    })

    if (transactionError) {
      console.error("Error creating transaction record:", transactionError)
      // Continue anyway since payment was successful
    }

    // Redirect to order details page
    return NextResponse.redirect(new URL(`/orders/${orderId}?payment=success`, request.url))
  } catch (error: any) {
    console.error("Error processing payment success:", error)
    return NextResponse.redirect(new URL(`/payment-error?error=${encodeURIComponent(error.message)}`, request.url))
  }
}
