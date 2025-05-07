import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Truck, CheckCircle, Clock, CreditCard } from "lucide-react"
import { DeliveryStats } from "@/components/delivery-partner/delivery-stats"
import { RecentDeliveries } from "@/components/delivery-partner/recent-deliveries"

export const dynamic = "force-dynamic"

export default async function DeliveryPartnerDashboardPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <div>Please log in to access this page</div>
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get delivery partner info
  const { data: partner } = await supabase.from("delivery_partners").select("*").eq("user_id", session.user.id).single()

  // Get active deliveries
  const { data: activeDeliveries } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_partner_id", partner?.id || "")
    .in("status", ["dispatched"])
    .order("created_at", { ascending: false })

  // Get completed deliveries
  const { data: completedDeliveries } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_partner_id", partner?.id || "")
    .in("status", ["delivered"])
    .order("created_at", { ascending: false })

  // Get earnings
  const { data: earnings } = await supabase
    .from("delivery_partner_earnings")
    .select("amount")
    .eq("delivery_partner_id", partner?.id || "")

  const totalEarnings = earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome, {profile?.business_name || profile?.full_name || profile?.email || "Driver"}
        </h2>
        <p className="text-muted-foreground">Here's what's happening with your deliveries today.</p>
      </div>

      <DeliveryStats
        activeDeliveries={activeDeliveries?.length || 0}
        completedDeliveries={completedDeliveries?.length || 0}
        pendingDeliveries={0}
        totalEarnings={totalEarnings}
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
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/delivery-partner/profile">
                <Clock className="mr-2 h-4 w-4" />
                Update Profile
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

      {(activeDeliveries?.length || 0) > 0 && (
        <RecentDeliveries title="Active Deliveries" deliveries={activeDeliveries || []} limit={5} />
      )}

      {(completedDeliveries?.length || 0) > 0 && (
        <RecentDeliveries title="Recent Completed Deliveries" deliveries={completedDeliveries || []} limit={5} />
      )}
    </div>
  )
}
