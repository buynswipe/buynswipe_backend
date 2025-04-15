import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, business_name")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Only delivery partners can update their profiles through this endpoint
    if (profile.role !== "delivery_partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { fullName, phone, vehicleType, vehicleNumber, address, city, pincode } = await request.json()

    // Validate required fields
    if (!vehicleType || !vehicleNumber) {
      return NextResponse.json({ error: "Vehicle type and vehicle number are required" }, { status: 400 })
    }

    // Update profile information
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        business_name: fullName,
        phone: phone,
        address: address,
        city: city,
        pincode: pincode,
      })
      .eq("id", session.user.id)

    if (updateProfileError) {
      console.error("Error updating profile:", updateProfileError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Check if delivery partner record exists
    const { data: deliveryPartner, error: deliveryPartnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("id", session.user.id)
      .single()

    if (deliveryPartnerError && deliveryPartnerError.code !== "PGRST116") {
      console.error("Error checking delivery partner:", deliveryPartnerError)
      return NextResponse.json({ error: "Failed to check delivery partner record" }, { status: 500 })
    }

    if (deliveryPartner) {
      // Update existing delivery partner record
      const { error: updateDeliveryPartnerError } = await supabase
        .from("delivery_partners")
        .update({
          name: fullName,
          phone: phone,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          address: address,
          city: city,
          pincode: pincode,
        })
        .eq("id", session.user.id)

      if (updateDeliveryPartnerError) {
        console.error("Error updating delivery partner:", updateDeliveryPartnerError)
        return NextResponse.json({ error: "Failed to update delivery partner record" }, { status: 500 })
      }
    } else {
      // Create new delivery partner record
      const { error: createDeliveryPartnerError } = await supabase.from("delivery_partners").insert({
        id: session.user.id,
        name: fullName,
        phone: phone,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        address: address,
        city: city,
        pincode: pincode,
        is_active: true,
        user_id: session.user.id,
      })

      if (createDeliveryPartnerError) {
        console.error("Error creating delivery partner:", createDeliveryPartnerError)
        return NextResponse.json({ error: "Failed to create delivery partner record" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error: any) {
    console.error("Error in profile update API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
