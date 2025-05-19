import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DeliveryStats } from "@/components/delivery-partner/delivery-stats"
import { RecentDeliveries } from "@/components/delivery-partner/recent-deliveries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Truck, CheckCircle, CreditCard } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DeliveryPartnerDashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get delivery partner info
  const { data: partner, error: partnerError } = await supabase
    .from("delivery_partners")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (partnerError && !partnerError.message.includes("No rows found")) {
    console.error("Error fetching delivery partner:", partnerError)
  }

  // If no partner found, create sample data for development
  const partnerId = partner?.id || "dev-partner-id"

  // Get active deliveries
  const { data: activeData, error: activeError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode, phone),
      wholesaler:wholesaler_id(business_name)
    `)
    .eq("delivery_partner_id", partnerId)
    .in("status", ["dispatched", "in_transit", "out_for_delivery"])
    .order("created_at", { ascending: false })

  if (activeError) {
    console.error("Error fetching active deliveries:", activeError)
  }

  // Get completed deliveries
  const { data: completedData, error: completedError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode, phone),
      wholesaler:wholesaler_id(business_name)
    `)
    .eq("delivery_partner_id", partnerId)
    .eq("status", "delivered")
    .order("created_at", { ascending: false })

  if (completedError) {
    console.error("Error fetching completed deliveries:", completedError)
  }

  // Get earnings
  const { data: earningsData, error: earningsError } = await supabase
    .from("delivery_partner_earnings")
    .select("amount")
    .eq("delivery_partner_id", partnerId)

  if (earningsError) {
    console.error("Error fetching earnings:", earningsError)
  }

  const totalEarnings = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

  // Create sample data if no real data exists
  const activeDeliveries = activeData || []
  const completedDeliveries = completedData || []

  // If no data found, create sample data for development
  const useSampleData = activeDeliveries.length === 0 && completedDeliveries.length === 0

  const sampleActiveDeliveries = [
    {
      id: "2abb2968-29ab-46d7-bfb1-a47640e5027f",
      created_at: new Date().toISOString(),
      status: "dispatched",
      total_amount: 60.0,
      payment_method: "cod",
      retailer_id: "sample-retailer",
      wholesaler_id: "sample-wholesaler",
      retailer: {
        business_name: "Sample Retail Store",
        address: "123 Retail Street",
        city: "Delhi",
        pincode: "110001",
        phone: "9876543211",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
    {
      id: "cb40debd-9c0f-434d-a401-8b8915d8e4ea",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: "in_transit",
      total_amount: 120.0,
      payment_method: "cod",
      retailer_id: "sample-retailer-2",
      wholesaler_id: "sample-wholesaler",
      retailer: {
        business_name: "City Retail Shop",
        address: "456 Market Road",
        city: "Mumbai",
        pincode: "400001",
        phone: "9876543222",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
  ]

  const sampleCompletedDeliveries = [
    {
      id: "3cdd3069-3a9c-47d8-bfc2-b58640e6028g",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: "delivered",
      total_amount: 85.5,
      payment_method: "cod",
      retailer_id: "sample-retailer-3",
      wholesaler_id: "sample-wholesaler",
      retailer: {
        business_name: "Corner Store",
        address: "789 Main Street",
        city: "Bangalore",
        pincode: "560001",
        phone: "9876543233",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
  ]

  const displayActiveDeliveries = useSampleData ? sampleActiveDeliveries : activeDeliveries
  const displayCompletedDeliveries = useSampleData ? sampleCompletedDeliveries : completedDeliveries
  const displayTotalEarnings = useSampleData ? 265.5 : totalEarnings

  return (
    <div className="space-y-6">
      {useSampleData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            <strong>Development Mode:</strong> Showing sample data because no real deliveries are assigned to this
            partner.
          </p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
        <h2 className="text-2xl font-bold tracking-tight">Welcome, Delivery Partner</h2>
        <p className="text-muted-foreground">Here's what's happening with your deliveries today.</p>
      </div>

      <DeliveryStats
        activeDeliveries={displayActiveDeliveries.length}
        completedDeliveries={displayCompletedDeliveries.length}
        pendingDeliveries={0}
        totalEarnings={displayTotalEarnings}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start">
              <Link href="/delivery-partner/active">
                <Truck className="mr-2 h-4 w-4" />
                View Active Deliveries
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/delivery-partner/earnings">
                <CreditCard className="mr-2 h-4 w-4" />
                View Earnings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Manage your active deliveries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Complete deliveries and collect payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Track your earnings and payouts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {displayActiveDeliveries.length > 0 && (
        <RecentDeliveries title="Active Deliveries" deliveries={displayActiveDeliveries} limit={5} />
      )}

      {displayCompletedDeliveries.length > 0 && (
        <RecentDeliveries title="Recent Completed Deliveries" deliveries={displayCompletedDeliveries} limit={5} />
      )}
    </div>
  )
}
