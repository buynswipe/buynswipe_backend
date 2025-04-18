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
      .select("id, business_name, email, phone, address, city, pincode")
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
      .select("id, user_id, name, email, phone")

    if (partnersError) {
      return NextResponse.json(
        { success: false, message: `Error fetching delivery partners: ${partnersError.message}` },
        { status: 500 },
      )
    }

    // Track results
    const results = {
      created: 0,
      updated: 0,
      ordersFixed: 0,
      errors: 0,
    }

    // 3. Create delivery partner records for profiles without them
    for (const profile of deliveryPartnerProfiles) {
      const existingPartner = deliveryPartners.find((partner) => partner.user_id === profile.id)

      if (!existingPartner) {
        // Create a new delivery partner record
        const { error: createError } = await supabase.from("delivery_partners").insert({
          id: profile.id, // Use the same ID as the profile
          name: profile.business_name || "Delivery Partner",
          phone: profile.phone || "",
          email: profile.email || "",
          vehicle_type: "bike", // Default value
          vehicle_number: "TBD", // Default value
          address: profile.address || "",
          city: profile.city || "",
          pincode: profile.pincode || "",
          is_active: true,
          user_id: profile.id, // Link to the user account
        })

        if (createError) {
          console.error(`Error creating delivery partner for ${profile.id}:`, createError)
          results.errors++
        } else {
          results.created++
        }
      }
    }

    // 4. Update delivery partner records without linked profiles
    for (const partner of deliveryPartners) {
      if (!partner.user_id || !deliveryPartnerProfiles.some((profile) => profile.id === partner.user_id)) {
        // Skip if this is a wholesaler-specific delivery partner (not linked to a user)
        if (partner.id.includes("wholesaler")) continue

        // Find a matching profile by email or phone
        const matchingProfile = deliveryPartnerProfiles.find(
          (profile) =>
            (partner.email && profile.email === partner.email) || (partner.phone && profile.phone === partner.phone),
        )

        if (matchingProfile) {
          // Update the delivery partner record
          const { error: updateError } = await supabase
            .from("delivery_partners")
            .update({ user_id: matchingProfile.id })
            .eq("id", partner.id)

          if (updateError) {
            console.error(`Error updating delivery partner ${partner.id}:`, updateError)
            results.errors++
          } else {
            results.updated++
          }
        }
      }
    }

    // 5. Fix orders with invalid delivery partner IDs
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, delivery_partner_id")
      .not("delivery_partner_id", "is", null)

    if (ordersError) {
      return NextResponse.json(
        { success: false, message: `Error fetching orders: ${ordersError.message}` },
        { status: 500 },
      )
    }

    for (const order of orders) {
      // Check if the delivery_partner_id is a profile ID instead of a delivery partner ID
      const isProfileId =
        deliveryPartnerProfiles.some((profile) => profile.id === order.delivery_partner_id) &&
        !deliveryPartners.some((partner) => partner.id === order.delivery_partner_id)

      if (isProfileId) {
        // Find the delivery partner record with this user_id
        const matchingPartner = deliveryPartners.find((partner) => partner.user_id === order.delivery_partner_id)

        if (matchingPartner) {
          // Update the order to use the delivery partner ID
          const { error: updateError } = await supabase
            .from("orders")
            .update({ delivery_partner_id: matchingPartner.id })
            .eq("id", order.id)

          if (updateError) {
            console.error(`Error updating order ${order.id}:`, updateError)
            results.errors++
          } else {
            results.ordersFixed++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Delivery partner links fixed",
      results,
    })
  } catch (error: any) {
    console.error("Error in fix-delivery-partner-links:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
