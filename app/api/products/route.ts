import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

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
    // Check if user is a wholesaler
    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.role !== "wholesaler") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, description, category, price, stock, image_url } = await request.json()

    if (!name || !category || !price || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        wholesaler_id: session.user.id,
        name,
        description,
        category,
        price,
        stock_quantity: stock,
        initial_quantity: stock,
        image_url,
      })
      .select()
      .single()

    if (productError) {
      console.error("Error creating product:", productError)
      return NextResponse.json({ error: "Failed to create product", details: productError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error: any) {
    console.error("Error in POST /api/products:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(request.url)

  // Get query parameters
  const wholesalerId = url.searchParams.get("wholesalerId")
  const category = url.searchParams.get("category")

  try {
    let query = supabase.from("products").select("*")

    if (wholesalerId) {
      query = query.eq("wholesaler_id", wholesalerId)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data: products, error } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    })
  } catch (error: any) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
