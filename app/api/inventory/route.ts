import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    const action = searchParams.get("action") || "list"
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const lowStock = searchParams.get("lowStock") === "true"
    const outOfStock = searchParams.get("outOfStock") === "true"

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (action === "stats") {
      // Get inventory statistics
      const { data: products, error } = await supabase
        .from("products")
        .select("stock_quantity, price, cost_price, category, status")
        .eq("status", "active")

      if (error) {
        return NextResponse.json({ error: "Failed to fetch inventory stats" }, { status: 500 })
      }

      const stats = {
        totalItems: products?.length || 0,
        totalValue: products?.reduce((sum, p) => sum + p.stock_quantity * (p.cost_price || p.price), 0) || 0,
        lowStockItems: products?.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10).length || 0,
        outOfStockItems: products?.filter((p) => p.stock_quantity === 0).length || 0,
        categories: [],
      }

      // Calculate category distribution
      if (products) {
        const categoryMap = new Map<string, { count: number; value: number }>()
        products.forEach((product) => {
          const category = categoryMap.get(product.category) || { count: 0, value: 0 }
          category.count++
          category.value += product.stock_quantity * (product.cost_price || product.price)
          categoryMap.set(product.category, category)
        })

        stats.categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
          name,
          ...data,
        }))
      }

      return NextResponse.json({
        success: true,
        stats,
      })
    }

    if (action === "alerts") {
      // Get low stock alerts
      const { data: lowStockProducts, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .or("stock_quantity.eq.0,stock_quantity.lte.10")
        .order("stock_quantity", { ascending: true })

      if (error) {
        return NextResponse.json({ error: "Failed to fetch low stock alerts" }, { status: 500 })
      }

      const alerts =
        lowStockProducts?.map((product) => ({
          id: product.id,
          itemId: product.id,
          currentStock: product.stock_quantity,
          minStock: 10, // Default minimum stock level
          severity: product.stock_quantity === 0 ? "OUT_OF_STOCK" : product.stock_quantity <= 5 ? "CRITICAL" : "LOW",
          createdAt: new Date().toISOString(),
          acknowledged: false,
          product: {
            name: product.name,
            sku: product.sku,
            category: product.category,
          },
        })) || []

      return NextResponse.json({
        success: true,
        alerts,
      })
    }

    // Default: List inventory items
    let query = supabase.from("products").select("*").eq("status", "active")

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
    }

    // Apply category filter
    if (category) {
      query = query.eq("category", category)
    }

    // Apply stock filters
    if (lowStock) {
      query = query.gt("stock_quantity", 0).lte("stock_quantity", 10)
    }

    if (outOfStock) {
      query = query.eq("stock_quantity", 0)
    }

    const { data: products, error } = await query.order("name")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: products || [],
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

    const { action, item_id, quantity, type, reason } = body

    if (action === "update_stock") {
      // Update stock quantity
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", item_id)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      const newStock =
        type === "IN"
          ? product.stock_quantity + Number.parseInt(quantity)
          : product.stock_quantity - Number.parseInt(quantity)

      if (newStock < 0) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item_id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
      }

      // Record stock movement
      const { error: movementError } = await supabase.from("stock_movements").insert({
        item_id,
        type,
        quantity: Number.parseInt(quantity),
        reason,
        user_id: session.user.id,
        timestamp: new Date().toISOString(),
      })

      if (movementError) {
        console.error("Failed to record stock movement:", movementError)
        // Continue even if movement recording fails
      }

      return NextResponse.json({
        success: true,
        message: "Stock updated successfully",
        new_stock: newStock,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
