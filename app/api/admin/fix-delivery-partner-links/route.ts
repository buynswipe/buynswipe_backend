import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user profile to check role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
  }

  try {
    // Get all delivery partners without user_id
    const { data: unlinkedPartners, error: unlinkedError } = await supabase
      .from("delivery_partners")
      .select("id, name, email, phone")
      .is("user_id", null)

    if (unlinkedError) {
      return NextResponse.json(
        { error: `Failed to fetch unlinked partners: ${unlinkedError.message}` },
        { status: 500 },
      )
    }

    if (!unlinkedPartners || unlinkedPartners.length === 0) {
      return NextResponse.json({ success: true, message: "All delivery partners are already linked to user accounts" })
    }

    // For each unlinked partner, try to find a matching user
    const results = []
    for (const partner of unlinkedPartners) {
      // Try to find a user with matching email
      if (partner.email) {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("email", partner.email)
          .eq("role", "delivery_partner")

        if (!usersError && users && users.length > 0) {
          // Link the partner to the user
          const { error: updateError } = await supabase
            .from("delivery_partners")
            .update({ user_id: users[0].id })
            .eq("id", partner.id)

          if (updateError) {
            results.push({
              partner: partner.name,
              success: false,
              message: `Failed to link to user: ${updateError.message}`,
            })
          } else {
            results.push({
              partner: partner.name,
              success: true,
              message: `Linked to user ${users[0].id} with email ${users[0].email}`,
            })
          }
          continue
        }
      }

      // Try to find a user with matching phone
      if (partner.phone) {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, phone, role")
          .eq("phone", partner.phone)
          .eq("role", "delivery_partner")

        if (!usersError && users && users.length > 0) {
          // Link the partner to the user
          const { error: updateError } = await supabase
            .from("delivery_partners")
            .update({ user_id: users[0].id })
            .eq("id", partner.id)

          if (updateError) {
            results.push({
              partner: partner.name,
              success: false,
              message: `Failed to link to user: ${updateError.message}`,
            })
          } else {
            results.push({
              partner: partner.name,
              success: true,
              message: `Linked to user ${users[0].id} with phone ${users[0].phone}`,
            })
          }
          continue
        }
      }

      // If no matching user found, report it
      results.push({
        partner: partner.name,
        success: false,
        message: "No matching user found with the same email or phone",
      })
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${unlinkedPartners.length} unlinked delivery partners`,
      results,
    })
  } catch (error: any) {
    console.error("Error fixing delivery partner links:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
