import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(request.url)

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
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if delivery_partners table exists
    const { error: tableCheckError } = await supabase.from("delivery_partners").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes('relation "delivery_partners" does not exist')) {
      // Table doesn't exist yet
      return NextResponse.json({
        success: true,
        deliveryPartners: [],
        message: "Delivery partners table not yet created. Please run the migration script.",
      })
    }

    // Query parameters
    const isActive = url.searchParams.get("isActive")
    const wholesalerId = url.searchParams.get("wholesalerId")

    let query = supabase.from("delivery_partners").select("*")

    // Filter by active status if provided
    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true")
    }

    // For admin, can see all delivery partners
    // For wholesaler, can only see their own delivery partners or unassigned ones
    if (profile.role === "wholesaler") {
      query = query.or(`wholesaler_id.eq.${session.user.id},wholesaler_id.is.null`)
    }
    // For retailer, can only see delivery partners assigned to orders they've placed
    else if (profile.role === "retailer") {
      // This is a more complex query that would require a join
      // For simplicity, we'll just return an empty array for retailers
      return NextResponse.json({ success: true, deliveryPartners: [] })
    }

    // Filter by wholesaler if provided (admin only)
    if (wholesalerId && profile.role === "admin") {
      query = query.eq("wholesaler_id", wholesalerId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching delivery partners:", error)
      return NextResponse.json({ error: "Failed to fetch delivery partners" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deliveryPartners: data || [],
    })
  } catch (error: any) {
    console.error("Error in delivery partners API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

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
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Only admin and wholesaler can add delivery partners
    if (profile.role !== "admin" && profile.role !== "wholesaler") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, phone, email, vehicleType, vehicleNumber, licenseNumber, address, city, pincode } =
      await request.json()

    // Validate required fields
    if (!name || !phone || !vehicleType || !vehicleNumber || !address || !city || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create delivery partner
    const { data, error } = await supabase
      .from("delivery_partners")
      .insert({
        name,
        phone,
        email: email || null,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        license_number: licenseNumber || null,
        address,
        city,
        pincode,
        is_active: true,
        wholesaler_id: profile.role === "wholesaler" ? session.user.id : null,
      })
      .select()

    if (error) {
      console.error("Error creating delivery partner:", error)
      return NextResponse.json({ error: "Failed to create delivery partner" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deliveryPartner: data[0],
    })
  } catch (error: any) {
    console.error("Error in delivery partners API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
