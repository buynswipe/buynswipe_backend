import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const email = "driver@retailbandhu.com"
  const password = "driver123"
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user already exists and delete if needed
    const { data: existingUser } = await supabase.from("auth.users").select("id").eq("email", email).single()

    if (existingUser) {
      // Delete existing user if found
      await supabase.auth.admin.deleteUser(existingUser.id)
    }

    // Create new user
    const { data: userData, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "delivery_partner" },
    })

    if (createUserError) {
      console.error("Error creating user:", createUserError)
      return NextResponse.json({ error: createUserError.message }, { status: 500 })
    }

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userData.user.id,
        email,
        role: "delivery_partner",
        business_name: "Demo Delivery Partner",
        phone: "9876543210",
        address: "123 Delivery St",
        city: "Demo City",
        pincode: "123456",
        is_approved: true,
      },
      { onConflict: "id" },
    )

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Create delivery partner record
    const { error: deliveryPartnerError } = await supabase.from("delivery_partners").insert({
      name: "Demo Delivery Partner",
      phone: "9876543210",
      email,
      vehicle_type: "bike",
      vehicle_number: "DL01AB1234",
      license_number: "DL12345678",
      address: "123 Delivery St",
      city: "Demo City",
      pincode: "123456",
      is_active: true,
      user_id: userData.user.id,
    })

    if (deliveryPartnerError) {
      console.error("Error creating delivery partner:", deliveryPartnerError)
      return NextResponse.json({ error: deliveryPartnerError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Delivery partner user created successfully",
      user: {
        id: userData.user.id,
        email,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
