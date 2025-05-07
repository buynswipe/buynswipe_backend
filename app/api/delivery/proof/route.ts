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
    const { orderId, photo, signature, notes, receiverName } = await request.json()

    // Get delivery partner ID
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (partnerError) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    // Create delivery proof
    const { error: proofError } = await supabase.from("delivery_proofs").insert({
      order_id: orderId,
      delivery_partner_id: partner.id,
      photo_url: photo || null,
      signature_url: signature || null,
      notes: notes || null,
      receiver_name: receiverName,
    })

    if (proofError) {
      return NextResponse.json({ error: "Failed to save delivery proof" }, { status: 500 })
    }

    // Update order status to delivered
    const { error: orderError } = await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId)

    if (orderError) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving delivery proof:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
