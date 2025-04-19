"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EarningsSummaryProps {
  deliveryPartnerId: string
}

export function EarningsSummary({ deliveryPartnerId }: EarningsSummaryProps) {
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedDeliveries: 0,
    thisMonthEarnings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchEarningsSummary() {
      try {
        setLoading(true)
        setError(null)

        // Get total earnings
        const { data: earningsData, error: earningsError } = await supabase
          .from("delivery_partner_earnings")
          .select("amount, status")
          .eq("delivery_partner_id", deliveryPartnerId)

        if (earningsError) {
          console.error("Error fetching earnings:", earningsError)

          // Check if the error is because the table doesn't exist
          if (earningsError.message.includes("does not exist")) {
            setTableExists(false)
            return
          }

          setError("Could not load earnings data")
          return
        }

        // Get completed deliveries count
        const { count: deliveriesCount, error: deliveriesError } = await supabase
          .from("delivery_status_updates")
          .select("*", { count: "exact", head: true })
          .eq("delivery_partner_id", deliveryPartnerId)
          .eq("status", "delivered")

        if (deliveriesError) {
          console.error("Error fetching deliveries:", deliveriesError)
          // Continue with zero count
        }

        // Calculate summary data
        const totalEarnings = earningsData?.reduce((sum, item) => sum + item.amount, 0) || 0
        const pendingPayouts =
          earningsData?.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amount, 0) || 0

        // Calculate this month's earnings
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const { data: monthEarningsData, error: monthEarningsError } = await supabase
          .from("delivery_partner_earnings")
          .select("amount")
          .eq("delivery_partner_id", deliveryPartnerId)
          .gte("created_at", firstDayOfMonth.toISOString())

        if (monthEarningsError) {
          console.error("Error fetching month earnings:", monthEarningsError)
          // Continue with zero
        }

        const thisMonthEarnings = monthEarningsData?.reduce((sum, item) => sum + item.amount, 0) || 0

        setSummary({
          totalEarnings,
          pendingPayouts,
          completedDeliveries: deliveriesCount || 0,
          thisMonthEarnings,
        })
      } catch (error) {
        console.error("Error fetching earnings summary:", error)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEarningsSummary()
  }, [deliveryPartnerId, supabase])

  if (!tableExists) {
    return (
      <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Earnings System Not Available</AlertTitle>
        <AlertDescription>
          The earnings tracking system is not yet set up. Please contact an administrator.
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalEarnings)}</div>
          <p className="text-xs text-muted-foreground">Lifetime earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.thisMonthEarnings)}</div>
          <p className="text-xs text-muted-foreground">Current month earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.pendingPayouts)}</div>
          <p className="text-xs text-muted-foreground">To be paid out</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.completedDeliveries}</div>
          <p className="text-xs text-muted-foreground">Completed deliveries</p>
        </CardContent>
      </Card>
    </div>
  )
}
