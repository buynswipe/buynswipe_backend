import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // 1. Get all profiles with role = delivery_partner
    const { data: deliveryPartnerProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, business_name, email")
      .eq("role", "delivery_partner")

    if (profilesError) {
      return NextResponse.json(
        { success: false, message: `Error fetching delivery partner profiles: ${profilesError.message}` },
        { status: 500 },
      )
    }

    // 2. Get all delivery_partners records
    const { data: deliveryPartners, error: partnersError } = await supabase
      .from("delivery_partners")
      .select("id, user_id, name, email")

    if (partnersError) {
      return NextResponse.json(
        { success: false, message: `Error fetching delivery partners: ${partnersError.message}` },
        { status: 500 },
      )
    }

    // 3. Check for profiles without delivery partner records
    const profilesWithoutPartners = deliveryPartnerProfiles.filter(
      (profile) => !deliveryPartners.some((partner) => partner.user_id === profile.id),
    )

    // 4. Check for delivery partner records without linked profiles
    const partnersWithoutProfiles = deliveryPartners.filter(
      (partner) => !partner.user_id || !deliveryPartnerProfiles.some((profile) => profile.id === partner.user_id),
    )

    // 5. Check for delivery partner records with mismatched IDs
    const mismatchedIds = deliveryPartners.filter((partner) => partner.user_id && partner.id !== partner.user_id)

    // 6. Check for orders assigned to delivery partners
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, delivery_partner_id, status")
      .not("delivery_partner_id", "is", null)

    if (ordersError) {
      return NextResponse.json(
        { success: false, message: `Error fetching orders: ${ordersError.message}` },
        { status: 500 },
      )
    }

    // 7. Check for orders with invalid delivery partner IDs
    const ordersWithInvalidPartners = orders.filter(
      (order) => !deliveryPartners.some((partner) => partner.id === order.delivery_partner_id),
    )

    // 8. Check if orders are using user_id instead of delivery_partner.id
    const ordersUsingUserId = orders.filter(
      (order) =>
        !deliveryPartners.some((partner) => partner.id === order.delivery_partner_id) &&
        deliveryPartnerProfiles.some((profile) => profile.id === order.delivery_partner_id),
    )

    return NextResponse.json({
      success: true,
      summary: {
        totalProfiles: deliveryPartnerProfiles.length,
        totalPartners: deliveryPartners.length,
        totalOrders: orders.length,
        profilesWithoutPartners: profilesWithoutPartners.length,
        partnersWithoutProfiles: partnersWithoutProfiles.length,
        mismatchedIds: mismatchedIds.length,
        ordersWithInvalidPartners: ordersWithInvalidPartners.length,
        ordersUsingUserId: ordersUsingUserId.length,
      },
      details: {
        profilesWithoutPartners,
        partnersWithoutProfiles,
        mismatchedIds,
        ordersWithInvalidPartners,
        ordersUsingUserId,
      },
    })
  } catch (error: any) {
    console.error("Error in verify-delivery-partner-links:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
