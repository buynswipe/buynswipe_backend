import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Get all profiles with role = delivery_partner
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, business_name, phone, email")
      .eq("role", "delivery_partner")

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`)
    }

    const results = {
      total: profiles.length,
      created: 0,
      existing: 0,
      errors: 0,
    }

    for (const profile of profiles) {
      // Check if a delivery partner record exists for this user
      const { data: existingPartner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("id")
        .eq("id", profile.id)
        .single()

      if (partnerError && partnerError.code !== "PGRST116") {
        // PGRST116 is "not found"
        results.errors++
        continue
      }

      if (!existingPartner) {
        // Create a new delivery partner record
        const { error: createError } = await supabase.from("delivery_partners").insert({
          id: profile.id, // Use the same ID as the profile
          name: profile.business_name,
          phone: profile.phone || "",
          email: profile.email || "",
          vehicle_type: "bike", // Default values
          vehicle_number: "",
          license_number: "",
          address: "",
          city: "",
          pincode: "",
          is_active: true,
        })

        if (createError) {
          results.errors++
        } else {
          results.created++
        }
      } else {
        results.existing++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Delivery partner linking completed",
      results,
    })
  } catch (error: any) {
    console.error("Error in linking delivery partners:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
