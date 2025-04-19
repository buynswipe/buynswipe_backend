import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { createServerNotification } from "@/lib/unified-notification-service"
import { validate as isValidUUID } from "uuid"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { orderId, deliveryPartnerId, instructions } = await request.json()

    if (!orderId || !deliveryPartnerId) {
      console.error("Missing required fields:", { orderId, deliveryPartnerId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure deliveryPartnerId is a valid UUID string
    if (typeof deliveryPartnerId !== "string" || !isValidUUID(deliveryPartnerId)) {
      console.error("Invalid deliveryPartnerId:", { deliveryPartnerId })
      return NextResponse.json({ error: "Invalid deliveryPartnerId format" }, { status: 400 })
    }

    console.log("Assigning delivery:", { orderId, deliveryPartnerId })

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, retailer:profiles!retailer_id(id, business_name, address, city, pincode)")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Order error:", orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is authorized to assign delivery partner
    if (profile.role === "wholesaler" && order.wholesaler_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (profile.role === "retailer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if delivery partner exists
    const { data: deliveryPartner, error: deliveryPartnerError } = await supabase
      .from("delivery_partners")
      .select("*")
      .eq("id", deliveryPartnerId)
      .single()

    if (deliveryPartnerError || !deliveryPartner) {
      console.error("Delivery partner error:", deliveryPartnerError)
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    if (!deliveryPartner.is_active) {
      return NextResponse.json({ error: "Selected delivery partner is inactive" }, { status: 400 })
    }

    // Update order with delivery partner and instructions
    const updateData: any = {
      delivery_partner_id: deliveryPartnerId,
      delivery_instructions: instructions || null,
      status: "dispatched", // Use 'dispatched' status
    }

    const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to assign delivery partner" }, { status: 500 })
    }

    // Create a delivery status update entry
    const { error: statusUpdateError } = await supabase.from("delivery_status_updates").insert({
      order_id: orderId,
      delivery_partner_id: deliveryPartnerId,
      status: "dispatched", // Use 'dispatched' status
      notes: `Assigned by ${profile.role} (${session.user.id})`,
    })

    if (statusUpdateError) {
      console.error("Error creating status update:", statusUpdateError)
      // Continue despite error
    }

    // Send notifications about delivery partner assignment
    try {
      const orderNumber = orderId.substring(0, 8)

      // If delivery partner has a user_id, send a notification
      if (deliveryPartner.user_id) {
        await createServerNotification({
          user_id: deliveryPartner.user_id,
          title: "New Delivery Assignment",
          message: `You have been assigned to deliver order #${orderNumber} to ${order.retailer.business_name} in ${order.retailer.city}.`,
          type: "info",
          related_entity_type: "delivery",
          related_entity_id: orderId,
          action_url: `/delivery-partner/tracking/${orderId}`,
        })
      }

      // Notify retailer about delivery partner assignment
      await createServerNotification({
        user_id: order.retailer_id,
        title: "Delivery Partner Assigned",
        message: `${deliveryPartner.name} has been assigned to deliver your order #${orderNumber}.`,
        type: "info",
        related_entity_type: "delivery",
        related_entity_id: orderId,
        action_url: `/orders/${orderId}`,
      })

      // Notification to wholesaler (for record)
      await createServerNotification({
        user_id: session.user.id,
        title: "Delivery Partner Assigned",
        message: `${deliveryPartner.name} has been assigned to deliver order #${orderNumber} to ${order.retailer.business_name}.`,
        type: "info",
        related_entity_type: "delivery",
        related_entity_id: orderId,
        action_url: `/orders/${orderId}`,
      })
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError)
      // Continue anyway, don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: "Delivery partner assigned successfully",
      orderId,
      deliveryPartnerId,
    })
  } catch (error: any) {
    console.error("Error assigning delivery partner:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
