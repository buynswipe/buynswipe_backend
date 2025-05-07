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

  // Verify hash to ensure the response is from PayU
  const isValidHash = verifyHash(params)
  if (!isValidHash) {
    return NextResponse.redirect(new URL(`/payment-error?error=Invalid response hash`, request.url))
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get order ID from udf1
    const orderId = params.udf1

    if (!orderId) {
      return NextResponse.redirect(new URL(`/payment-error?error=Order ID not found`, request.url))
    }

    // Update order payment reference
    await supabase
      .from("orders")
      .update({
        payment_reference: params.txnid,
      })
      .eq("id", orderId)

    // Create failed transaction record
    await supabase
      .from("transactions")
      .insert({
        order_id: orderId,
        amount: Number.parseFloat(params.amount),
        payment_method: "upi",
        status: "failed",
        transaction_fee: 0,
        external_reference: params.mihpayid || params.txnid,
      })
      .catch((err) => console.error("Error creating failed transaction record:", err))

    // Redirect to order details page with error
    return NextResponse.redirect(
      new URL(
        `/orders/${orderId}?payment=failed&error=${encodeURIComponent(params.error_Message || "Payment failed")}`,
        request.url,
      ),
    )
  } catch (error: any) {
    console.error("Error processing payment failure:", error)
    return NextResponse.redirect(new URL(`/payment-error?error=${encodeURIComponent(error.message)}`, request.url))
  }
}
