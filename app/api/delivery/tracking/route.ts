import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { orderId, status, locationLat, locationLng, notes } = await request.json()

    // Get delivery partner ID
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (partnerError) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    // Create delivery status update
    const { error: updateError } = await supabase.from("delivery_status_updates").insert({
      order_id: orderId,
      delivery_partner_id: partner.id,
      status: status || "in_transit",
      location_lat: locationLat || null,
      location_lng: locationLng || null,
      notes: notes || null,
    })

    if (updateError) {
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    // If status is provided, update the order status
    if (status) {
      const { error: orderError } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (orderError) {
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating delivery status:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(request.url)
  const orderId = url.searchParams.get("orderId")

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 })
    }

    // Get delivery status updates
    const { data: updates, error: updatesError } = await supabase
      .from("delivery_status_updates")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })

    if (updatesError) {
      return NextResponse.json({ error: "Failed to fetch delivery updates" }, { status: 500 })
    }

    // Get delivery proof if available
    const { data: proof, error: proofError } = await supabase
      .from("delivery_proofs")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle()

    if (proofError) {
      return NextResponse.json({ error: "Failed to fetch delivery proof" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updates,
      proof: proof || null,
    })
  } catch (error: any) {
    console.error("Error fetching delivery tracking:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
