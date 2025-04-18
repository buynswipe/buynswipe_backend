import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createServerNotification } from "@/lib/unified-notification-service"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    console.log("Unauthorized: No session found")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { orderId, deliveryPartnerId, instructions } = await request.json()

    console.log(`Attempting to assign delivery partner ${deliveryPartnerId} to order ${orderId}`)

    if (!orderId || !deliveryPartnerId) {
      console.log("Missing required fields: orderId or deliveryPartnerId")
      return NextResponse.json({ error: "Order ID and delivery partner ID are required" }, { status: 400 })
    }

    // Get the user's profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if user is authorized to update this order
    if (profile.role !== "admin" && profile.role !== "wholesaler") {
      console.log(`Unauthorized: User role is ${profile.role}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the order to check if it belongs to the wholesaler
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, wholesaler_id, status, retailer_id")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // If user is a wholesaler, check if the order belongs to them
    if (profile.role === "wholesaler" && order.wholesaler_id !== session.user.id) {
      console.log(`Unauthorized: Order does not belong to wholesaler`)
      return NextResponse.json(
        { error: "Unauthorized. You can only assign delivery partners to your own orders" },
        { status: 403 },
      )
    }

    // Check if the order status allows assigning a delivery partner
    if (order.status !== "confirmed" && order.status !== "dispatched") {
      console.log(`Invalid order status: ${order.status}`)
      return NextResponse.json(
        {
          error: `Cannot assign delivery partner to order with status '${order.status}'. Order must be 'confirmed' or 'dispatched'`,
        },
        { status: 400 },
      )
    }

    // Verify the delivery partner exists and get their user_id
    const { data: deliveryPartner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("id, user_id, name")
      .eq("id", deliveryPartnerId)
      .single()

    if (partnerError) {
      console.error("Error fetching delivery partner:", partnerError)
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    // Check if the delivery partner has a user_id
    if (!deliveryPartner.user_id) {
      console.warn("Delivery partner does not have a user_id:", deliveryPartnerId)
      // Continue with the process, but log a warning
    } else {
      console.log("Delivery partner user_id:", deliveryPartner.user_id)
    }

    console.log("Assigning delivery partner:", {
      orderId,
      deliveryPartnerId,
      deliveryPartnerUserId: deliveryPartner.user_id,
      deliveryPartnerName: deliveryPartner.name,
    })

    // Update the order with the delivery partner ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        delivery_partner_id: deliveryPartnerId,
        status: "dispatched", // Update status to dispatched when assigning delivery partner
        delivery_instructions: instructions || null, // Make sure instructions are saved
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to assign delivery partner" }, { status: 500 })
    }

    // Create a delivery status update record
    const { error: statusError } = await supabase.from("delivery_status_updates").insert({
      order_id: orderId,
      delivery_partner_id: deliveryPartnerId,
      status: "assigned",
    })

    if (statusError) {
      console.error("Error creating delivery status update:", statusError)
      // Continue with the process even if status update fails
    }

    // Send notification to the delivery partner if they have a user account
    if (deliveryPartner.user_id) {
      try {
        await createServerNotification({
          user_id: deliveryPartner.user_id,
          title: "New Delivery Assigned",
          message: `You have been assigned a new delivery for order #${orderId.substring(0, 8)}`,
          type: "info",
          entity_type: "delivery",
          entity_id: orderId,
          action_url: `/delivery-partner/tracking/${orderId}`,
        })
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError)
        // Continue with the process even if notification fails
      }
    }

    // Also notify the retailer
    try {
      await createServerNotification({
        user_id: order.retailer_id,
        title: "Order Dispatched",
        message: `Your order #${orderId.substring(0, 8)} has been dispatched and is on its way.`,
        type: "info",
        entity_type: "order",
        entity_id: orderId,
        action_url: `/orders/${orderId}`,
      })
    } catch (notificationError) {
      console.error("Error sending retailer notification:", notificationError)
      // Continue with the process even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Delivery partner assigned successfully",
      data: {
        orderId,
        deliveryPartnerId,
        status: "dispatched",
      },
    })
  } catch (error: any) {
    console.error("Error in assign-delivery API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
