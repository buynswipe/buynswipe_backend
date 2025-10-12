import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export async function POST() {
  try {
    // Create a Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase credentials" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

    const email = "driver@retailbandhu.com"
    const password = "driver123"

    // First, check if the user already exists by listing users with this email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error("Error listing users:", listError)
      return NextResponse.json({ error: listError.message || "Failed to list users" }, { status: 500 })
    }

    // Find the user with the matching email
    const existingUser = users?.users.find((user) => user.email === email)

    if (existingUser) {
      // Delete the existing user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id)

      if (deleteError) {
        console.error("Error deleting user:", deleteError)
        return NextResponse.json({ error: deleteError.message || "Failed to delete existing user" }, { status: 500 })
      }

      // Also delete from profiles table
      await supabaseAdmin.from("profiles").delete().eq("id", existingUser.id)
    }

    // Create the new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !newUser) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: createError?.message || "Failed to create user" }, { status: 500 })
    }

    // Update the user's role in the profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "delivery_partner" })
      .eq("id", newUser.user.id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Try to create a delivery partner record
    try {
      const { error: deliveryPartnerError } = await supabaseAdmin.from("delivery_partners").upsert({
        name: "Demo Driver",
        phone: "1234567890",
        email: "driver@retailbandhu.com",
        vehicle_type: "bike",
        vehicle_number: "DL01AB1234",
        address: "123 Demo Street",
        city: "Demo City",
        pincode: "110001",
        is_active: true,
        // Using upsert, so we need to provide a primary key
        id: newUser.user.id,
      })

      if (deliveryPartnerError) {
        console.error("Error creating delivery partner record:", deliveryPartnerError)
        // Continue anyway, as we've created the user with the correct role
      }
    } catch (error) {
      console.error("Error creating delivery partner record:", error)
      // Continue anyway, as we've created the user with the correct role
    }

    return NextResponse.json(
      {
        success: true,
        message: "Delivery partner created successfully",
        credentials: {
          email,
          password,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
