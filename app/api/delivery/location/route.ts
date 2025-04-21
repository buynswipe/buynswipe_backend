import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    // Validate required fields
    if (!body.orderId || !body.latitude || !body.longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get delivery partner ID
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (partnerError || !partner) {
      console.error("Error finding delivery partner:", partnerError)
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    // Verify this delivery partner is assigned to this order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, delivery_partner_id")
      .eq("id", body.orderId)
      .single()

    if (orderError) {
      console.error("Error finding order:", orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.delivery_partner_id !== partner.id) {
      return NextResponse.json({ error: "You are not assigned to this order" }, { status: 403 })
    }

    // Insert location update
    const { data, error } = await supabase.from("delivery_tracking").insert({
      order_id: body.orderId,
      delivery_partner_id: partner.id,
      latitude: body.latitude,
      longitude: body.longitude,
      status: body.status || "in_transit",
      notes: body.notes,
    })

    if (error) {
      console.error("Error inserting location update:", error)
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
    }

    // If status is provided, update order status
    if (body.status && body.status !== "in_transit") {
      const { error: statusError } = await supabase
        .from("orders")
        .update({ status: body.status })
        .eq("id", body.orderId)

      if (statusError) {
        console.error("Error updating order status:", statusError)
        // Continue execution even if status update fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in delivery location API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
