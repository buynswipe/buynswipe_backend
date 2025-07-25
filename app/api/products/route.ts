import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Build query
    let query = supabase.from("products").select("*", { count: "exact" })

    // Filter by wholesaler if user is wholesaler
    if (profile.role === "wholesaler") {
      query = query.eq("wholesaler_id", session.user.id)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%,brand.ilike.%${search}%`)
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Apply sorting
    const ascending = sortOrder === "asc"
    query = query.order(sortBy, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error: productsError, count } = await query

    if (productsError) {
      console.error("Error fetching products:", productsError)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Calculate stats
    const { data: allProducts, error: statsError } = await supabase
      .from("products")
      .select("stock_quantity, price, cost_price, category, status")
      .eq(
        profile.role === "wholesaler" ? "wholesaler_id" : "id",
        profile.role === "wholesaler" ? session.user.id : "all",
      )

    const stats = {
      total_products: 0,
      active_products: 0,
      low_stock_products: 0,
      out_of_stock_products: 0,
      total_value: 0,
      categories: [] as Array<{ name: string; count: number; percentage: number }>,
    }

    if (!statsError && allProducts) {
      stats.total_products = allProducts.length
      stats.active_products = allProducts.filter((p) => p.status === "active").length
      stats.low_stock_products = allProducts.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10).length
      stats.out_of_stock_products = allProducts.filter((p) => p.stock_quantity === 0).length
      stats.total_value = allProducts.reduce((sum, p) => sum + p.stock_quantity * (p.cost_price || p.price), 0)

      // Calculate category distribution
      const categoryMap = new Map<string, number>()
      allProducts.forEach((product) => {
        const count = categoryMap.get(product.category) || 0
        categoryMap.set(product.category, count + 1)
      })

      stats.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / allProducts.length) * 100),
      }))
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    const { name, category, price } = body
    if (!name || !category || !price) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, category, price",
        },
        { status: 400 },
      )
    }

    // Prepare product data
    const productData = {
      ...body,
      wholesaler_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Generate SKU if not provided
      sku: body.sku || `AUTO-${Date.now()}`,
      // Generate barcode if not provided
      barcode: body.barcode || `${Date.now()}`,
      // Calculate margin percentage
      margin_percentage: body.cost_price
        ? ((Number.parseFloat(price) - Number.parseFloat(body.cost_price)) / Number.parseFloat(price)) * 100
        : 0,
    }

    const { data: product, error: insertError } = await supabase.from("products").insert(productData).select().single()

    if (insertError) {
      console.error("Error creating product:", insertError)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Product created successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
