import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get delivery partner ID
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (partnerError) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status") || "delivered"

    // Get completed deliveries
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("orders")
      .select(`
        *,
        profiles:retailer_id(business_name, address, city, pincode, phone),
        delivery_proofs(*)
      `)
      .eq("delivery_partner_id", partner.id)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (deliveriesError) {
      return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deliveries,
    })
  } catch (error) {
    console.error("Error fetching delivery history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
