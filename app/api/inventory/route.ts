import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const lowStock = searchParams.get("lowStock") === "true"
    const outOfStock = searchParams.get("outOfStock") === "true"

    switch (action) {
      case "stats":
        return await getInventoryStats()
      case "alerts":
        return await getLowStockAlerts()
      case "movements":
        return await getStockMovements(searchParams.get("itemId"))
      case "analytics":
        return await getAnalyticsData(searchParams.get("timeRange") || "30d")
      default:
        return await searchInventory({ search, category, lowStock, outOfStock })
    }
  } catch (error) {
    console.error("Inventory API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case "addItem":
        return await addInventoryItem(body.item)
      case "updateStock":
        return await updateStock(body)
      case "acknowledgeAlert":
        return await acknowledgeAlert(body.alertId, body.userId)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Inventory API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getInventoryStats() {
  const { data: items, error } = await supabase
    .from("inventory_items")
    .select("stock, price, cost_price, category, min_stock")
    .eq("is_active", true)

  if (error) throw error

  const stats = {
    totalItems: items.length,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categories: [] as { name: string; count: number; value: number }[],
  }

  const categoryMap = new Map<string, { count: number; value: number }>()

  items.forEach((item) => {
    const itemValue = item.stock * item.cost_price
    stats.totalValue += itemValue

    if (item.stock === 0) {
      stats.outOfStockItems++
    } else if (item.stock <= item.min_stock) {
      stats.lowStockItems++
    }

    const category = categoryMap.get(item.category) || { count: 0, value: 0 }
    category.count++
    category.value += itemValue
    categoryMap.set(item.category, category)
  })

  stats.categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }))

  return NextResponse.json(stats)
}

async function getLowStockAlerts() {
  const { data: alerts, error } = await supabase
    .from("low_stock_alerts")
    .select(`
      *,
      inventory_items (
        name,
        barcode,
        category
      )
    `)
    .eq("acknowledged", false)
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error

  return NextResponse.json({ alerts: alerts || [] })
}

async function searchInventory(filters: {
  search?: string | null
  category?: string | null
  lowStock?: boolean
  outOfStock?: boolean
}) {
  let query = supabase.from("inventory_items").select("*").eq("is_active", true)

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    )
  }

  if (filters.category) {
    query = query.eq("category", filters.category)
  }

  if (filters.lowStock) {
    query = query.lt("stock", "min_stock")
  }

  if (filters.outOfStock) {
    query = query.eq("stock", 0)
  }

  const { data: items, error } = await query.order("name")

  if (error) throw error

  return NextResponse.json({ items: items || [] })
}

async function getStockMovements(itemId?: string | null) {
  let query = supabase
    .from("stock_movements")
    .select(`
      *,
      inventory_items (
        name,
        barcode
      )
    `)
    .order("timestamp", { ascending: false })
    .limit(50)

  if (itemId) {
    query = query.eq("item_id", itemId)
  }

  const { data: movements, error } = await query

  if (error) throw error

  return NextResponse.json({ movements: movements || [] })
}

async function getAnalyticsData(timeRange: string) {
  // Mock analytics data - implement actual calculations based on your needs
  const mockData = {
    stockMovements: [
      { date: "2024-01-01", inbound: 120, outbound: 80, adjustments: 5 },
      { date: "2024-01-02", inbound: 95, outbound: 110, adjustments: 2 },
      { date: "2024-01-03", inbound: 140, outbound: 95, adjustments: 8 },
      { date: "2024-01-04", inbound: 110, outbound: 125, adjustments: 3 },
      { date: "2024-01-05", inbound: 85, outbound: 90, adjustments: 1 },
      { date: "2024-01-06", inbound: 160, outbound: 140, adjustments: 6 },
      { date: "2024-01-07", inbound: 130, outbound: 115, adjustments: 4 },
    ],
    categoryPerformance: [
      { category: "Beverages", value: 45000, count: 25, growth: 12.5 },
      { category: "Snacks", value: 32000, count: 18, growth: 8.3 },
      { category: "Groceries", value: 28000, count: 22, growth: -2.1 },
      { category: "Personal Care", value: 15000, count: 12, growth: 15.7 },
      { category: "Household", value: 12000, count: 8, growth: 5.2 },
    ],
    topMovingItems: [
      { name: "Coca Cola 500ml", barcode: "1234567890123", movement: 150, trend: "up" },
      { name: "Lays Classic 50g", barcode: "9876543210987", movement: 120, trend: "up" },
      { name: "Maggi Noodles", barcode: "5555555555555", movement: 95, trend: "stable" },
      { name: "Colgate Total", barcode: "1111111111111", movement: 75, trend: "down" },
      { name: "Surf Excel 1kg", barcode: "7777777777777", movement: 60, trend: "up" },
    ],
    stockTurnover: [
      { month: "Jan", turnover: 4.2, target: 4.0 },
      { month: "Feb", turnover: 3.8, target: 4.0 },
      { month: "Mar", turnover: 4.5, target: 4.0 },
      { month: "Apr", turnover: 4.1, target: 4.0 },
      { month: "May", turnover: 4.7, target: 4.0 },
      { month: "Jun", turnover: 4.3, target: 4.0 },
    ],
    alerts: { critical: 5, warning: 12, info: 8 },
  }

  return NextResponse.json(mockData)
}

async function addInventoryItem(item: any) {
  const { data, error } = await supabase.from("inventory_items").insert(item).select("id").single()

  if (error) throw error

  return NextResponse.json({ success: true, id: data.id })
}

async function updateStock(body: {
  itemId: string
  quantity: number
  type: "IN" | "OUT" | "ADJUSTMENT"
  reason: string
  userId: string
}) {
  const { itemId, quantity, type, reason, userId } = body

  // Get current stock
  const { data: item, error: fetchError } = await supabase
    .from("inventory_items")
    .select("stock")
    .eq("id", itemId)
    .single()

  if (fetchError) throw fetchError

  const newStock = type === "IN" ? item.stock + quantity : item.stock - quantity

  if (newStock < 0) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
  }

  // Update stock
  const { error: updateError } = await supabase
    .from("inventory_items")
    .update({
      stock: newStock,
      last_restocked: type === "IN" ? new Date().toISOString() : undefined,
    })
    .eq("id", itemId)

  if (updateError) throw updateError

  // Record movement
  const { error: movementError } = await supabase.from("stock_movements").insert({
    item_id: itemId,
    type,
    quantity,
    reason,
    user_id: userId,
    timestamp: new Date().toISOString(),
  })

  if (movementError) throw movementError

  return NextResponse.json({ success: true, newStock })
}

async function acknowledgeAlert(alertId: string, userId: string) {
  const { error } = await supabase
    .from("low_stock_alerts")
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userId,
    })
    .eq("id", alertId)

  if (error) throw error

  return NextResponse.json({ success: true })
}
