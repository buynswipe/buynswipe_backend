import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { createServerNotification } from "@/lib/unified-notification-service"

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
    // Check if user is a retailer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, business_name")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.role !== "retailer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { wholesalerId, items, paymentMethod, notes } = await request.json()

    if (!wholesalerId || !items || !items.length || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate total amount
    let totalAmount = 0

    // Validate items and calculate total
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 })
      }

      // Get product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("price, stock_quantity")
        .eq("id", item.productId)
        .single()

      if (productError || !product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 })
      }

      // Check if enough stock is available
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for product: ${item.productId}` }, { status: 400 })
      }

      totalAmount += product.price * item.quantity
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        retailer_id: session.user.id,
        wholesaler_id: wholesalerId,
        status: "placed",
        payment_method: paymentMethod,
        payment_status: paymentMethod === "upi" ? "pending" : "pending",
        total_amount: totalAmount,
        notes,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: 0, // Will be updated below
    }))

    // Get product prices
    for (let i = 0; i < orderItems.length; i++) {
      const { data: product } = await supabase
        .from("products")
        .select("price")
        .eq("id", orderItems[i].product_id)
        .single()

      if (product) {
        orderItems[i].price = product.price
      }
    }

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      // Rollback order creation
      await supabase.from("orders").delete().eq("id", order.id)

      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 })
    }

    // Update product stock quantities
    for (const item of items) {
      // Get current stock quantity
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", item.productId)
        .single()

      if (product) {
        // Update stock quantity
        const newStockQuantity = product.stock_quantity - item.quantity

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock_quantity: newStockQuantity })
          .eq("id", item.productId)

        if (updateError) {
          console.error(`Failed to update stock for product ${item.productId}:`, updateError)
          // Continue with other products even if one fails
        }
      }
    }

    // Send notification to wholesaler about new order
    try {
      await createServerNotification({
        user_id: wholesalerId,
        title: "New Order Received",
        message: `Order #${order.id.substring(0, 8)} has been placed by ${profile.business_name} for ₹${totalAmount.toFixed(2)}`,
        type: "info",
        related_entity_type: "order",
        related_entity_id: order.id,
        action_url: `/orders/${order.id}`,
      })
    } catch (notificationError) {
      console.error("Failed to send notification to wholesaler:", notificationError)
      // Continue with the response, don't fail the request
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    let query = supabase.from("orders").select(`
    *,
    retailer:profiles!retailer_id(*),
    wholesaler:profiles!wholesaler_id(*),
    order_items(*)
  `)

    if (profile.role === "retailer") {
      query = query.eq("retailer_id", session.user.id)
    } else if (profile.role === "wholesaler") {
      query = query.eq("wholesaler_id", session.user.id)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
