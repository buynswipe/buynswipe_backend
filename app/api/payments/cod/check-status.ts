import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId parameter" }, { status: 400 })
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is authorized to view this order
    if (order.retailer_id !== session.user.id && order.wholesaler_id !== session.user.id && profile.role !== "admin") {
      return NextResponse.json({ error: "You are not authorized to view this order" }, { status: 403 })
    }

    // Check if payment is already marked as paid
    const paymentStatus = order.payment_status

    // Check if a transaction exists for this order
    let hasTransaction = false
    let transactionError = null

    try {
      const { data, error } = await supabase.from("transactions").select("id").eq("order_id", orderId).maybeSingle()

      if (error) {
        if (error.message.includes('relation "transactions" does not exist')) {
          // Table doesn't exist, but we can still return the payment status
          console.log("Transactions table doesn't exist yet")
          transactionError = "TABLE_NOT_FOUND"
        } else {
          console.error("Error checking transaction:", error)
          transactionError = error.message
        }
      } else {
        hasTransaction = !!data
      }
    } catch (error: any) {
      console.error("Error in transaction check:", error)
      transactionError = error.message
    }

    return NextResponse.json({
      paymentStatus,
      hasTransaction,
      transactionError,
      orderStatus: order.status,
    })
  } catch (error: any) {
    console.error("Error in check-status API:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
