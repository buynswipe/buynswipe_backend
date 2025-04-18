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

    // Get user profile to check if they're a delivery partner
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    // Only delivery partners and admins can update delivery status
    if (profile.role !== "delivery_partner" && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only delivery partners can update delivery status" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { orderId, status, location, notes } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 })
    }

    // Check if the delivery partner is assigned to this order
    if (profile.role === "delivery_partner") {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("delivery_partner_id")
        .eq("id", orderId)
        .single()

      if (orderError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      if (order.delivery_partner_id !== session.user.id) {
        return NextResponse.json({ error: "You are not assigned to this order" }, { status: 403 })
      }
    }

    // Update the order status
    const { error: orderUpdateError } = await supabase.from("orders").update({ status }).eq("id", orderId)

    if (orderUpdateError) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    // Create a delivery update record
    const { data: updateData, error: updateError } = await supabase
      .from("delivery_updates")
      .insert({
        order_id: orderId,
        status,
        location,
        notes,
        updated_by: session.user.id,
      })
      .select()

    if (updateError) {
      return NextResponse.json({ error: "Failed to create delivery update" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updateData[0],
    })
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
