import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createServerNotification } from "@/lib/unified-notification-service"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get session to verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { orderId, status, estimatedDelivery } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["placed", "confirmed", "dispatched", "delivered", "rejected"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get order details to check permissions
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, retailer:profiles!retailer_id(business_name), wholesaler:profiles!wholesaler_id(business_name)")
      .eq("id", orderId)
      .single()

    if (orderError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is authorized to update this order
    if (order.wholesaler_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to update this order" }, { status: 403 })
    }

    // Update order status
    const updateData: any = { status }

    // Add estimated delivery date if provided
    if (estimatedDelivery && status === "dispatched") {
      updateData.estimated_delivery = estimatedDelivery
    }

    const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", orderId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Send notifications about status change
    try {
      // Format status for display
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1)
      const orderNumber = orderId.substring(0, 8)

      // Notification to retailer
      await createServerNotification({
        user_id: order.retailer_id,
        title: `Order ${formattedStatus}`,
        message: `Your order #${orderNumber} has been ${status} by ${order.wholesaler.business_name}.`,
        type: status === "rejected" ? "error" : status === "confirmed" || status === "delivered" ? "success" : "info",
        entity_type: "order",
        entity_id: orderId,
        action_url: `/orders/${orderId}`,
      })

      // Notification to wholesaler (for record)
      await createServerNotification({
        user_id: order.wholesaler_id,
        title: `Order ${formattedStatus}`,
        message: `Order #${orderNumber} for ${order.retailer.business_name} has been marked as ${status}.`,
        type: "info",
        entity_type: "order",
        entity_id: orderId,
        action_url: `/orders/${orderId}`,
      })

      // If there's a delivery partner and status is dispatched, notify them too
      if (status === "dispatched" && order.delivery_partner_id) {
        // First get the delivery partner to find their user_id
        const { data: deliveryPartner } = await supabase
          .from("delivery_partners")
          .select("user_id")
          .eq("id", order.delivery_partner_id)
          .single()

        if (deliveryPartner && deliveryPartner.user_id) {
          await createServerNotification({
            user_id: deliveryPartner.user_id,
            title: "Order Ready for Pickup",
            message: `Order #${orderNumber} is ready for pickup and delivery.`,
            type: "info",
            entity_type: "order",
            entity_id: orderId,
            action_url: `/delivery-partner/active`,
          })
        }
      }
    } catch (notificationError) {
      console.error("Failed to send status update notifications:", notificationError)
      // Continue with the response, don't fail the request
    }

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
