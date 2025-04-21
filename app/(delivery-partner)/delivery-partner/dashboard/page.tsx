import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DeliveryStats } from "@/components/delivery-partner/delivery-stats"
import { RecentDeliveries } from "@/components/delivery-partner/recent-deliveries"

export const dynamic = "force-dynamic"

export default async function DeliveryPartnerDashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "delivery_partner") {
    redirect("/dashboard")
  }

  try {
    // Get delivery partner ID
    const { data: deliveryPartner, error: deliveryPartnerError } = await supabase
      .from("delivery_partners")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    if (deliveryPartnerError) {
      console.error("Error fetching delivery partner:", deliveryPartnerError)
      throw new Error("Failed to fetch delivery partner profile")
    }

    // Get assigned orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        status,
        total_amount,
        payment_method,
        payment_status,
        retailer:profiles!retailer_id(business_name, address, city, pincode, phone)
      `,
      )
      .eq("delivery_partner_id", deliveryPartner.id)
      .in("status", ["dispatched", "in_transit", "out_for_delivery"])
      .order("created_at", { ascending: false })
      .limit(5)

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      throw new Error("Failed to fetch assigned orders")
    }

    // Get delivery stats
    const { data: stats, error: statsError } = await supabase.rpc("get_delivery_partner_stats", {
      partner_id: deliveryPartner.id,
    })

    // If RPC fails, get stats manually
    let deliveryStats = {
      total_deliveries: 0,
      completed_deliveries: 0,
      active_deliveries: 0,
      total_earnings: 0,
    }

    if (statsError) {
      console.error("Error fetching delivery stats via RPC:", statsError)

      // Fallback: Get stats manually
      const { data: completedOrders, error: completedError } = await supabase
        .from("orders")
        .select("id")
        .eq("delivery_partner_id", deliveryPartner.id)
        .eq("status", "delivered")

      const { data: activeOrders, error: activeError } = await supabase
        .from("orders")
        .select("id")
        .eq("delivery_partner_id", deliveryPartner.id)
        .in("status", ["dispatched", "in_transit", "out_for_delivery"])

      const { data: earnings, error: earningsError } = await supabase
        .from("delivery_partner_earnings")
        .select("amount")
        .eq("delivery_partner_id", deliveryPartner.id)
        .eq("status", "paid")

      deliveryStats = {
        total_deliveries: (completedOrders?.length || 0) + (activeOrders?.length || 0),
        completed_deliveries: completedOrders?.length || 0,
        active_deliveries: activeOrders?.length || 0,
        total_earnings: earnings?.reduce((sum, item) => sum + item.amount, 0) || 0,
      }
    } else {
      deliveryStats = stats
    }

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>

        <DeliveryStats stats={deliveryStats} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
          <RecentDeliveries orders={orders || []} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in DeliveryPartnerDashboardPage:", error)

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>There was an error loading your dashboard. Please try again later.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Deliveries</h3>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Earnings</h3>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No recent deliveries to display</p>
          </div>
        </div>
      </div>
    )
  }
}
