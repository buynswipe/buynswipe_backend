"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Truck, CheckCircle, CreditCard } from "lucide-react"
import { DeliveryStats } from "@/components/delivery-partner/delivery-stats"
import { RecentDeliveries } from "@/components/delivery-partner/recent-deliveries"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

export default function DeliveryPartnerDashboardPage() {
  const router = useRouter()
  const [activeDeliveries, setActiveDeliveries] = useState([])
  const [completedDeliveries, setCompletedDeliveries] = useState([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Get delivery partner info
        const { data: partner } = await supabase
          .from("delivery_partners")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (!partner) {
          throw new Error("Delivery partner not found")
        }

        // Get active deliveries
        const { data: activeData } = await supabase
          .from("orders")
          .select("*")
          .eq("delivery_partner_id", partner.id)
          .in("status", ["dispatched"])
          .order("created_at", { ascending: false })

        setActiveDeliveries(activeData || [])

        // Get completed deliveries
        const { data: completedData } = await supabase
          .from("orders")
          .select("*")
          .eq("delivery_partner_id", partner.id)
          .in("status", ["delivered"])
          .order("created_at", { ascending: false })

        setCompletedDeliveries(completedData || [])

        // Get earnings
        const { data: earningsData } = await supabase
          .from("delivery_partner_earnings")
          .select("amount")
          .eq("delivery_partner_id", partner.id)

        const total = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
        setTotalEarnings(total)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
        <h2 className="text-2xl font-bold tracking-tight">Welcome, Delivery Partner</h2>
        <p className="text-muted-foreground">Here's what's happening with your deliveries today.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
      ) : (
        <>
          <DeliveryStats
            activeDeliveries={activeDeliveries.length}
            completedDeliveries={completedDeliveries.length}
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

          <RecentDeliveries title="Active Deliveries" deliveries={activeDeliveries} limit={5} />

          <RecentDeliveries title="Recent Completed Deliveries" deliveries={completedDeliveries} limit={5} />
        </>
      )}
    </div>
  )
}
