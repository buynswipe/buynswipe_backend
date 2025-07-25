import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const barcode = searchParams.get("barcode")
    const featured = searchParams.get("featured")
    const sort = searchParams.get("sort") || "name"
    const order = searchParams.get("order") || "asc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Mock products data - in production, this would come from your database
    const mockProducts = [
      {
        id: "1",
        name: "Premium Basmati Rice 1kg",
        description: "High-quality aged basmati rice with long grains and aromatic fragrance",
        category: "Groceries",
        subcategory: "Rice & Grains",
        brand: "Royal Brand",
        sku: "RB-RICE-001",
        barcode: "8901030895016",
        price: 85.0,
        cost_price: 65.0,
        margin_percentage: 30.77,
        stock_quantity: 150,
        min_stock_level: 50,
        max_stock_level: 500,
        unit: "kg",
        weight: 1.0,
        dimensions: { length: 25, width: 15, height: 5 },
        images: ["/placeholder.svg?height=200&width=200"],
        tags: ["premium", "organic", "aromatic"],
        status: "active",
        featured: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        supplier: {
          id: "sup1",
          name: "ABC Rice Mills",
          contact: "+91 9876543210",
        },
        sales_data: {
          total_sold: 450,
          revenue: 38250,
          last_sale_date: "2024-01-15T14:30:00Z",
        },
      },
      {
        id: "2",
        name: "Whole Wheat Flour 1kg",
        description: "Fresh ground whole wheat flour, rich in fiber and nutrients",
        category: "Groceries",
        subcategory: "Flour & Grains",
        brand: "Nature's Best",
        sku: "NB-FLOUR-001",
        barcode: "8901030895017",
        price: 45.0,
        cost_price: 35.0,
        margin_percentage: 28.57,
        stock_quantity: 25,
        min_stock_level: 30,
        max_stock_level: 200,
        unit: "kg",
        weight: 1.0,
        dimensions: { length: 20, width: 12, height: 4 },
        images: ["/placeholder.svg?height=200&width=200"],
        tags: ["whole-grain", "healthy", "fresh"],
        status: "active",
        featured: false,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-15T09:15:00Z",
        supplier: {
          id: "sup2",
          name: "XYZ Flour Mills",
          contact: "+91 9876543211",
        },
        sales_data: {
          total_sold: 320,
          revenue: 14400,
          last_sale_date: "2024-01-14T16:45:00Z",
        },
      },
      {
        id: "3",
        name: "Refined Sugar 1kg",
        description: "Pure white refined sugar, perfect for cooking and beverages",
        category: "Groceries",
        subcategory: "Sugar & Sweeteners",
        brand: "Sweet Crystal",
        sku: "SC-SUGAR-001",
        barcode: "8901030895018",
        price: 50.0,
        cost_price: 42.0,
        margin_percentage: 19.05,
        stock_quantity: 0,
        min_stock_level: 20,
        max_stock_level: 150,
        unit: "kg",
        weight: 1.0,
        dimensions: { length: 18, width: 12, height: 6 },
        images: ["/placeholder.svg?height=200&width=200"],
        tags: ["refined", "pure", "crystal"],
        status: "active",
        featured: false,
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-14T16:45:00Z",
        supplier: {
          id: "sup3",
          name: "Sweet Suppliers Ltd",
          contact: "+91 9876543212",
        },
        sales_data: {
          total_sold: 280,
          revenue: 14000,
          last_sale_date: "2024-01-14T12:30:00Z",
        },
      },
      {
        id: "4",
        name: "Premium Green Tea 250g",
        description: "Organic green tea leaves with natural antioxidants",
        category: "Beverages",
        subcategory: "Tea & Coffee",
        brand: "Tea Masters",
        sku: "TM-TEA-001",
        barcode: "8901030895019",
        price: 180.0,
        cost_price: 120.0,
        margin_percentage: 50.0,
        stock_quantity: 80,
        min_stock_level: 25,
        max_stock_level: 100,
        unit: "g",
        weight: 0.25,
        dimensions: { length: 15, width: 10, height: 8 },
        images: ["/placeholder.svg?height=200&width=200"],
        tags: ["organic", "antioxidant", "premium"],
        status: "active",
        featured: true,
        created_at: "2024-01-04T00:00:00Z",
        updated_at: "2024-01-15T11:20:00Z",
        supplier: {
          id: "sup4",
          name: "Tea Gardens Co.",
          contact: "+91 9876543213",
        },
        sales_data: {
          total_sold: 150,
          revenue: 27000,
          last_sale_date: "2024-01-15T10:15:00Z",
        },
      },
      {
        id: "5",
        name: "Cold Pressed Coconut Oil 1L",
        description: "Pure cold-pressed coconut oil, ideal for cooking and health",
        category: "Groceries",
        subcategory: "Oils & Ghee",
        brand: "Pure Nature",
        sku: "PN-OIL-001",
        barcode: "8901030895020",
        price: 220.0,
        cost_price: 150.0,
        margin_percentage: 46.67,
        stock_quantity: 15,
        min_stock_level: 20,
        max_stock_level: 100,
        unit: "L",
        weight: 1.0,
        dimensions: { length: 8, width: 8, height: 25 },
        images: ["/placeholder.svg?height=200&width=200"],
        tags: ["cold-pressed", "pure", "healthy"],
        status: "active",
        featured: false,
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-15T08:30:00Z",
        supplier: {
          id: "sup5",
          name: "Oil Industries Ltd",
          contact: "+91 9876543214",
        },
        sales_data: {
          total_sold: 95,
          revenue: 20900,
          last_sale_date: "2024-01-14T18:20:00Z",
        },
      },
    ]

    let filteredProducts = [...mockProducts]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.barcode.includes(search) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter((product) => product.category === category)
    }

    if (status && status !== "all") {
      filteredProducts = filteredProducts.filter((product) => product.status === status)
    }

    if (barcode) {
      filteredProducts = filteredProducts.filter((product) => product.barcode === barcode)
    }

    if (featured === "true") {
      filteredProducts = filteredProducts.filter((product) => product.featured)
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue: any = a[sort as keyof typeof a]
      let bValue: any = b[sort as keyof typeof b]

      // Handle nested properties
      if (sort === "sales_data.total_sold") {
        aValue = a.sales_data.total_sold
        bValue = b.sales_data.total_sold
      } else if (sort === "sales_data.revenue") {
        aValue = a.sales_data.revenue
        bValue = b.sales_data.revenue
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit)

    // Calculate statistics
    const stats = {
      total_products: mockProducts.length,
      active_products: mockProducts.filter((p) => p.status === "active").length,
      low_stock_products: mockProducts.filter((p) => p.stock_quantity <= p.min_stock_level).length,
      out_of_stock_products: mockProducts.filter((p) => p.stock_quantity === 0).length,
      total_value: mockProducts.reduce((sum, p) => sum + p.stock_quantity * p.cost_price, 0),
      categories: [
        {
          name: "Groceries",
          count: mockProducts.filter((p) => p.category === "Groceries").length,
          percentage: (mockProducts.filter((p) => p.category === "Groceries").length / mockProducts.length) * 100,
        },
        {
          name: "Beverages",
          count: mockProducts.filter((p) => p.category === "Beverages").length,
          percentage: (mockProducts.filter((p) => p.category === "Beverages").length / mockProducts.length) * 100,
        },
      ],
      top_selling: mockProducts
        .sort((a, b) => b.sales_data.total_sold - a.sales_data.total_sold)
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          sales: p.sales_data.total_sold,
          revenue: p.sales_data.revenue,
        })),
    }

    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      stats,
      pagination: {
        total: filteredProducts.length,
        limit,
        offset,
        has_more: offset + limit < filteredProducts.length,
      },
    })
  } catch (error: any) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      subcategory,
      brand,
      sku,
      barcode,
      price,
      cost_price,
      stock_quantity,
      min_stock_level,
      max_stock_level,
      unit,
      weight,
      dimensions,
      tags,
      status,
      featured,
    } = body

    // Validate required fields
    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: "Missing required fields: name, category, price" }, { status: 400 })
    }

    // Check for duplicate SKU or barcode
    // In production, this would check against the database
    const existingProducts = [] // Mock check
    if (sku && existingProducts.some((p: any) => p.sku === sku)) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
    }
    if (barcode && existingProducts.some((p: any) => p.barcode === barcode)) {
      return NextResponse.json({ error: "Barcode already exists" }, { status: 409 })
    }

    // Create new product
    const newProduct = {
      id: Date.now().toString(),
      name,
      description: description || "",
      category,
      subcategory: subcategory || "",
      brand: brand || "",
      sku: sku || `AUTO-${Date.now()}`,
      barcode: barcode || `${Date.now()}`,
      price: Number.parseFloat(price),
      cost_price: Number.parseFloat(cost_price) || 0,
      margin_percentage:
        Number.parseFloat(price) && Number.parseFloat(cost_price)
          ? ((Number.parseFloat(price) - Number.parseFloat(cost_price)) / Number.parseFloat(price)) * 100
          : 0,
      stock_quantity: Number.parseInt(stock_quantity) || 0,
      min_stock_level: Number.parseInt(min_stock_level) || 0,
      max_stock_level: Number.parseInt(max_stock_level) || 1000,
      unit: unit || "piece",
      weight: Number.parseFloat(weight) || 0,
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      images: ["/placeholder.svg?height=200&width=200"],
      tags: Array.isArray(tags) ? tags : tags ? tags.split(",").map((t: string) => t.trim()) : [],
      status: status || "active",
      featured: Boolean(featured),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      supplier: {
        id: "default",
        name: "Default Supplier",
        contact: "",
      },
      sales_data: {
        total_sold: 0,
        revenue: 0,
        last_sale_date: "",
      },
    }

    // In production, save to database
    // await supabase.from('products').insert(newProduct)

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    })
  } catch (error: any) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Calculate margin percentage if price and cost_price are provided
    if (updateData.price && updateData.cost_price) {
      updateData.margin_percentage =
        ((Number.parseFloat(updateData.price) - Number.parseFloat(updateData.cost_price)) /
          Number.parseFloat(updateData.price)) *
        100
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    // In production, update in database
    // await supabase.from('products').update(updateData).eq('id', id)

    return NextResponse.json({
      success: true,
      data: { id, ...updateData },
      message: "Product updated successfully",
    })
  } catch (error: any) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // In production, soft delete or hard delete from database
    // await supabase.from('products').delete().eq('id', id)
    // OR
    // await supabase.from('products').update({ status: 'deleted' }).eq('id', id)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error: any) {
    console.error("Product deletion error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
