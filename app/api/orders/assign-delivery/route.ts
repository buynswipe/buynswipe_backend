import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { createServerNotification } from "@/lib/unified-notification-service"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, retailer:profiles!retailer_id(id, business_name, address, city, pincode)")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
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
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    if (!deliveryPartner.is_active) {
      return NextResponse.json({ error: "Selected delivery partner is inactive" }, { status: 400 })
    }

    // Ensure delivery partner has vehicle information
    if (!deliveryPartner.vehicle_type || !deliveryPartner.vehicle_number) {
      return NextResponse.json({ error: "Delivery partner has incomplete vehicle information" }, { status: 400 })
    }

    // If wholesaler, check if delivery partner belongs to them
    if (
      profile.role === "wholesaler" &&
      deliveryPartner.wholesaler_id &&
      deliveryPartner.wholesaler_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized to use this delivery partner" }, { status: 403 })
    }

    // Update order with delivery partner, instructions, and status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        delivery_partner_id: deliveryPartnerId,
        delivery_instructions: instructions || null,
        status: "dispatched", // Automatically set status to dispatched when assigning delivery partner
      })
      .eq("id", orderId)

    // Log the update result
    console.log(`Order ${orderId} assigned to delivery partner ${deliveryPartnerId} with status set to dispatched`)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to assign delivery partner" }, { status: 500 })
    }

    // Verify the update was successful by fetching the order again
    const { data: updatedOrder, error: verifyError } = await supabase
      .from("orders")
      .select("delivery_partner_id, status")
      .eq("id", orderId)
      .single()

    if (verifyError) {
      console.error("Error verifying update:", verifyError)
    } else {
      console.log("Updated order:", updatedOrder)
      if (updatedOrder.delivery_partner_id !== deliveryPartnerId) {
        console.error("Delivery partner ID mismatch after update!")
      }
      if (updatedOrder.status !== "dispatched") {
        console.error("Status not set to dispatched after update!")
      }
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
          data: {
            address: order.retailer.address,
            city: order.retailer.city,
            pincode: order.retailer.pincode,
            phone: order.retailer.phone,
          },
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
        data: {
          delivery_partner_name: deliveryPartner.name,
          vehicle_type: deliveryPartner.vehicle_type,
          vehicle_number: deliveryPartner.vehicle_number,
          phone: deliveryPartner.phone,
        },
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
    })
  } catch (error: any) {
    console.error("Error assigning delivery partner:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
