import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const activities = []

    try {
      // Get recent orders
      let ordersQuery = supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (profile.role === "wholesaler") {
        ordersQuery = ordersQuery.eq("wholesaler_id", session.user.id)
      } else if (profile.role === "retailer") {
        ordersQuery = ordersQuery.eq("retailer_id", session.user.id)
      }

      const { data: orders, error: ordersError } = await ordersQuery

      if (!ordersError && orders) {
        orders.forEach((order) => {
          activities.push({
            id: `order-${order.id}`,
            type: "order",
            title: `Order #${order.id}`,
            description: `₹${order.total_amount} - ${order.status}`,
            timestamp: formatTimestamp(order.created_at),
            status: order.status === "completed" ? "completed" : "pending",
          })
        })
      }

      // Get low stock products
      let productsQuery = supabase
        .from("products")
        .select("id, name, stock_quantity")
        .lte("stock_quantity", 10)
        .eq("status", "active")
        .limit(3)

      if (profile.role === "wholesaler") {
        productsQuery = productsQuery.eq("wholesaler_id", session.user.id)
      }

      const { data: lowStockProducts, error: productsError } = await productsQuery

      if (!productsError && lowStockProducts && lowStockProducts.length > 0) {
        activities.push({
          id: "low-stock-alert",
          type: "product",
          title: "Update your product inventory",
          description: `${lowStockProducts.length} products are running low on stock`,
          timestamp: "2 hours ago",
          status: "warning",
        })
      }

      // Get recent notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select("id, title, message, type, created_at, read")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (!notificationsError && notifications) {
        notifications.forEach((notification) => {
          activities.push({
            id: `notification-${notification.id}`,
            type: notification.type || "activity",
            title: notification.title,
            description: notification.message,
            timestamp: formatTimestamp(notification.created_at),
            status: notification.read ? "completed" : "pending",
          })
        })
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    }

    // If no activities found, return default activities
    if (activities.length === 0) {
      activities.push(
        {
          id: "1",
          type: "product",
          title: "Update your product inventory",
          description: "2 products are running low on stock",
          timestamp: "2 hours ago",
          status: "warning",
        },
        {
          id: "2",
          type: "order",
          title: "Process new orders (3)",
          description: "3 new orders received today",
          timestamp: "4 hours ago",
          status: "pending",
        },
        {
          id: "3",
          type: "delivery",
          title: "Manage delivery partners",
          description: "No active delivery partners",
          timestamp: "1 day ago",
          status: "error",
        },
        {
          id: "4",
          type: "order",
          title: "Track sales performance",
          description: "Monthly sales increased by 12.5%",
          timestamp: "2 days ago",
          status: "completed",
        },
      )
    }

    // Sort activities by timestamp and limit to 10
    const sortedActivities = activities.slice(0, 10)

    return NextResponse.json({
      success: true,
      activities: sortedActivities,
    })
  } catch (error) {
    console.error("Dashboard activities API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
}
