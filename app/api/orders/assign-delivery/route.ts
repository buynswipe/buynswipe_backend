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

    // Get order details with retailer info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        retailer_id,
        wholesaler_id,
        retailer:profiles!retailer_id(id, business_name, address, city, pincode, phone)
      `)
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
    const { data: deliveryPartnerData, error: deliveryPartnerError } = await supabase
      .from("delivery_partners")
      .select("*")
      .eq("id", deliveryPartnerId)
      .single()

    if (deliveryPartnerError || !deliveryPartnerData) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    if (!deliveryPartnerData.is_active) {
      return NextResponse.json({ error: "Selected delivery partner is inactive" }, { status: 400 })
    }

    // Ensure delivery partner has vehicle information
    if (!deliveryPartnerData.vehicle_type || !deliveryPartnerData.vehicle_number) {
      return NextResponse.json({ error: "Delivery partner has incomplete vehicle information" }, { status: 400 })
    }

    // If wholesaler, check if delivery partner belongs to them
    if (
      profile.role === "wholesaler" &&
      deliveryPartnerData.wholesaler_id &&
      deliveryPartnerData.wholesaler_id !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized to use this delivery partner" }, { status: 403 })
    }

    // Ensure delivery partner has a user_id
    if (!deliveryPartnerData.user_id) {
      return NextResponse.json(
        { error: "Delivery partner is not linked to a user account. Please contact an administrator." },
        { status: 400 },
      )
    }

    // CRITICAL FIX: Log the values being updated
    console.log("Updating order with delivery partner:", {
      orderId,
      deliveryPartnerId,
      instructions: instructions || null,
      status: order.status === "placed" ? "confirmed" : order.status,
    })

    // Update order with delivery partner and instructions
    // Always ensure the status is at least "confirmed" if it's in "placed" status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        delivery_partner_id: deliveryPartnerId,
        delivery_instructions: instructions || null,
        status: order.status === "placed" ? "confirmed" : order.status,
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ error: "Failed to assign delivery partner" }, { status: 500 })
    }

    // Send notifications about delivery partner assignment
    try {
      const orderNumber = orderId.substring(0, 8)

      // CRITICAL FIX: Remove the first notification that's causing duplicates
      // Only create one notification with complete data

      // Fetch complete order details with retailer and wholesaler info
      const { data: completeOrder } = await supabase
        .from("orders")
        .select(`
          id,
          retailer:profiles!retailer_id(business_name, address, city, pincode, phone),
          wholesaler:profiles!wholesaler_id(business_name, address, city, pincode, phone)
        `)
        .eq("id", orderId)
        .single()

      if (deliveryPartnerData?.user_id) {
        // Create notification with complete address data
        await createServerNotification({
          user_id: deliveryPartnerData.user_id,
          title: "New Delivery Assignment",
          message: `You have been assigned to deliver order #${orderNumber} to ${order.retailer.business_name} in ${order.retailer.city || "your area"}.`,
          type: "info",
          related_entity_type: "delivery",
          related_entity_id: orderId,
          action_url: `/delivery-partner/tracking/${orderId}`,
          data: {
            // Include complete retailer information
            business_name: order.retailer.business_name,
            address: order.retailer.address,
            city: order.retailer.city,
            pincode: order.retailer.pincode,
            phone: order.retailer.phone,

            // Include wholesaler information if available
            pickup_business_name: completeOrder?.wholesaler?.business_name,
            pickup_address: completeOrder?.wholesaler?.address,
            pickup_city: completeOrder?.wholesaler?.city,
            pickup_pincode: completeOrder?.wholesaler?.pincode,
            pickup_phone: completeOrder?.wholesaler?.phone,

            delivery_instructions: instructions,
          },
        })
      }

      // Notify retailer about delivery partner assignment
      await createServerNotification({
        user_id: order.retailer_id,
        title: "Delivery Partner Assigned",
        message: `${deliveryPartnerData.name} has been assigned to deliver your order #${orderNumber}.`,
        type: "info",
        related_entity_type: "delivery",
        related_entity_id: orderId,
        action_url: `/orders/${orderId}`,
      })

      // Notification to wholesaler (for record)
      await createServerNotification({
        user_id: session.user.id,
        title: "Delivery Partner Assigned",
        message: `${deliveryPartnerData.name} has been assigned to deliver order #${orderNumber} to ${order.retailer.business_name}.`,
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
