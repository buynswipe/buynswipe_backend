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
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Mock inventory data - in production, this would come from your database
    const mockInventoryData = [
      {
        id: "1",
        name: "Rice 1kg",
        category: "Groceries",
        current_stock: 150,
        min_stock: 50,
        max_stock: 500,
        unit_price: 45.0,
        total_value: 6750,
        last_updated: "2024-01-15T10:30:00Z",
        status: "in_stock",
        barcode: "8901030895016",
        supplier: "ABC Suppliers",
        location: "Warehouse A-1",
        movement_history: [
          { date: "2024-01-15", type: "inbound", quantity: 100, reason: "Purchase Order #1001" },
          { date: "2024-01-14", type: "outbound", quantity: 50, reason: "Sale Order #2001" },
        ],
      },
      {
        id: "2",
        name: "Wheat Flour 1kg",
        category: "Groceries",
        current_stock: 25,
        min_stock: 30,
        max_stock: 200,
        unit_price: 35.0,
        total_value: 875,
        last_updated: "2024-01-15T09:15:00Z",
        status: "low_stock",
        barcode: "8901030895017",
        supplier: "XYZ Foods",
        location: "Warehouse A-2",
        movement_history: [
          { date: "2024-01-14", type: "outbound", quantity: 75, reason: "Sale Order #2002" },
          { date: "2024-01-13", type: "inbound", quantity: 100, reason: "Purchase Order #1002" },
        ],
      },
      {
        id: "3",
        name: "Sugar 1kg",
        category: "Groceries",
        current_stock: 0,
        min_stock: 20,
        max_stock: 150,
        unit_price: 42.0,
        total_value: 0,
        last_updated: "2024-01-14T16:45:00Z",
        status: "out_of_stock",
        barcode: "8901030895018",
        supplier: "Sweet Suppliers",
        location: "Warehouse A-3",
        movement_history: [
          { date: "2024-01-14", type: "outbound", quantity: 20, reason: "Sale Order #2003" },
          { date: "2024-01-12", type: "outbound", quantity: 30, reason: "Sale Order #2004" },
        ],
      },
      {
        id: "4",
        name: "Tea 250g",
        category: "Beverages",
        current_stock: 80,
        min_stock: 25,
        max_stock: 100,
        unit_price: 120.0,
        total_value: 9600,
        last_updated: "2024-01-15T11:20:00Z",
        status: "in_stock",
        barcode: "8901030895019",
        supplier: "Tea Masters",
        location: "Warehouse B-1",
        movement_history: [
          { date: "2024-01-15", type: "inbound", quantity: 50, reason: "Purchase Order #1003" },
          { date: "2024-01-14", type: "outbound", quantity: 20, reason: "Sale Order #2005" },
        ],
      },
      {
        id: "5",
        name: "Cooking Oil 1L",
        category: "Groceries",
        current_stock: 15,
        min_stock: 20,
        max_stock: 100,
        unit_price: 150.0,
        total_value: 2250,
        last_updated: "2024-01-15T08:30:00Z",
        status: "low_stock",
        barcode: "8901030895020",
        supplier: "Oil Industries",
        location: "Warehouse A-4",
        movement_history: [
          { date: "2024-01-14", type: "outbound", quantity: 35, reason: "Sale Order #2006" },
          { date: "2024-01-13", type: "inbound", quantity: 50, reason: "Purchase Order #1004" },
        ],
      },
    ]

    let filteredData = mockInventoryData

    // Apply filters
    if (category && category !== "all") {
      filteredData = filteredData.filter((item) => item.category === category)
    }

    if (status && status !== "all") {
      filteredData = filteredData.filter((item) => item.status === status)
    }

    if (search) {
      filteredData = filteredData.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.barcode.includes(search) ||
          item.supplier.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Calculate statistics
    const stats = {
      total_items: mockInventoryData.length,
      total_value: mockInventoryData.reduce((sum, item) => sum + item.total_value, 0),
      low_stock_items: mockInventoryData.filter((item) => item.status === "low_stock").length,
      out_of_stock_items: mockInventoryData.filter((item) => item.status === "out_of_stock").length,
      categories: [
        {
          name: "Groceries",
          count: mockInventoryData.filter((item) => item.category === "Groceries").length,
          value: mockInventoryData
            .filter((item) => item.category === "Groceries")
            .reduce((sum, item) => sum + item.total_value, 0),
          percentage: 80,
        },
        {
          name: "Beverages",
          count: mockInventoryData.filter((item) => item.category === "Beverages").length,
          value: mockInventoryData
            .filter((item) => item.category === "Beverages")
            .reduce((sum, item) => sum + item.total_value, 0),
          percentage: 20,
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      stats,
      pagination: {
        total: filteredData.length,
        page: 1,
        limit: 50,
      },
    })
  } catch (error: any) {
    console.error("Inventory API error:", error)
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
    const { name, category, current_stock, min_stock, max_stock, unit_price, barcode, supplier, location } = body

    // Validate required fields
    if (!name || !category || current_stock === undefined || !unit_price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, this would create a new inventory item in the database
    const newItem = {
      id: Date.now().toString(),
      name,
      category,
      current_stock: Number(current_stock),
      min_stock: Number(min_stock) || 0,
      max_stock: Number(max_stock) || 1000,
      unit_price: Number(unit_price),
      total_value: Number(current_stock) * Number(unit_price),
      last_updated: new Date().toISOString(),
      status:
        Number(current_stock) === 0
          ? "out_of_stock"
          : Number(current_stock) <= Number(min_stock)
            ? "low_stock"
            : "in_stock",
      barcode: barcode || `AUTO${Date.now()}`,
      supplier: supplier || "Unknown",
      location: location || "Default",
      movement_history: [
        {
          date: new Date().toISOString(),
          type: "inbound",
          quantity: Number(current_stock),
          reason: "Initial Stock",
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: newItem,
      message: "Inventory item created successfully",
    })
  } catch (error: any) {
    console.error("Inventory creation error:", error)
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
    const { id, current_stock, adjustment_reason } = body

    if (!id || current_stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, this would update the inventory item in the database
    const updatedItem = {
      id,
      current_stock: Number(current_stock),
      last_updated: new Date().toISOString(),
      adjustment_reason: adjustment_reason || "Manual adjustment",
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Inventory updated successfully",
    })
  } catch (error: any) {
    console.error("Inventory update error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
