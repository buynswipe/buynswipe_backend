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

    // 1. Add the updated_at column if it doesn't exist
    const { error: addColumnError } = await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
    })

    if (addColumnError) {
      console.error("Error adding updated_at column:", addColumnError)
      return NextResponse.json(
        { success: false, message: `Error adding updated_at column: ${addColumnError.message}` },
        { status: 500 },
      )
    }

    // 2. Refresh the schema cache
    const { error: refreshError } = await supabase.rpc("exec_sql", {
      sql: `NOTIFY pgrst, 'reload schema';`,
    })

    if (refreshError) {
      console.error("Error refreshing schema cache:", refreshError)
      return NextResponse.json(
        { success: false, message: `Error refreshing schema cache: ${refreshError.message}` },
        { status: 500 },
      )
    }

    // 3. Get all profiles with role = delivery_partner
    const { data: deliveryPartnerProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, business_name, phone, email")
      .eq("role", "delivery_partner")

    if (profilesError) {
      return NextResponse.json(
        { success: false, message: `Error fetching delivery partner profiles: ${profilesError.message}` },
        { status: 500 },
      )
    }

    // 4. Get all delivery_partners records
    const { data: deliveryPartners, error: partnersError } = await supabase
      .from("delivery_partners")
      .select("id, user_id, name, email")

    if (partnersError) {
      return NextResponse.json(
        { success: false, message: `Error fetching delivery partners: ${partnersError.message}` },
        { status: 500 },
      )
    }

    // Initialize counters
    let created = 0
    let updated = 0
    const orphaned = 0
    const results = { errors: 0 }

    // 5. For each delivery partner user, check if they have a delivery partner record
    for (const user of deliveryPartnerProfiles || []) {
      const existingPartner = deliveryPartners?.find((partner) => partner.user_id === user.id)

      if (existingPartner) {
        // Update the existing partner if needed
        const { error: updateError } = await supabase
          .from("delivery_partners")
          .update({
            name: user.business_name || existingPartner.name,
            phone: user.phone || existingPartner.phone,
            email: user.email || existingPartner.email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPartner.id)

        if (updateError) {
          console.error(`Error updating delivery partner for user ${user.id}:`, updateError)
          results.errors++
        } else {
          updated++
        }
      } else {
        // Create a new delivery partner record
        const { error: createError } = await supabase.from("delivery_partners").insert({
          id: user.id, // Use the same ID as the profile
          name: user.business_name || "Delivery Partner",
          phone: user.phone || "Not provided",
          email: user.email || "Not provided",
          vehicle_type: "bike", // Default value
          vehicle_number: "TBD", // Default value
          address: user.address || "",
          city: user.city || "",
          pincode: "",
          is_active: true,
          user_id: user.id, // Link to the user account
        })

        if (createError) {
          console.error(`Error creating delivery partner for user ${user.id}:`, createError)
          results.errors++
        } else {
          created++
        }
      }
    }

    // 6. Check for orphaned delivery partners (no user_id)
    const { data: orphanedPartners } = await supabase.from("delivery_partners").select("id, name").is("user_id", null)

    return NextResponse.json({
      success: true,
      message: "Delivery partners linked successfully",
      results: {
        created,
        updated,
        orphaned: orphanedPartners?.length || 0,
        total: (deliveryPartnerProfiles || []).length,
      },
    })
  } catch (error: any) {
    console.error("Error in link-delivery-partners-to-users:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
