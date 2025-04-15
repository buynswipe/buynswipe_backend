import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .single()

    if (userError) {
      return NextResponse.json({ error: `User not found: ${userError.message}` }, { status: 404 })
    }

    const userId = userData.id

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: `Error checking profile: ${profileError.message}` }, { status: 500 })
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error: createProfileError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        role: email.includes("driver") ? "delivery_partner" : "retailer",
        business_name: email.includes("driver") ? "Demo Delivery Service" : "Demo Business",
        phone: "9876543210",
        address: "123 Demo Street",
        city: "Demo City",
        pincode: "123456",
        is_approved: true,
      })

      if (createProfileError) {
        return NextResponse.json({ error: `Error creating profile: ${createProfileError.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Profile created successfully" })
    }

    return NextResponse.json({ success: true, message: "Profile already exists" })
  } catch (error: any) {
    console.error("Error in ensure-driver-profile API:", error)
    return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 })
  }
}
