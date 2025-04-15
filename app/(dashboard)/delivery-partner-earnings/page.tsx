"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, IndianRupee, Calendar, CheckCircle, Clock, Download } from "lucide-react"

interface Earning {
  id: string
  order_id: string
  amount: number
  status: "pending" | "paid" | "cancelled"
  created_at: string
  paid_at: string | null
}

export default function DeliveryPartnerEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalDeliveries: 0,
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Get delivery partner ID
        const { data: partner, error: partnerError } = await supabase
          .from("delivery_partners")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (partnerError) {
          throw new Error("Delivery partner not found")
        }

        // Fetch earnings
        const { data, error } = await supabase
          .from("delivery_partner_earnings")
          .select("*")
          .eq("delivery_partner_id", partner.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setEarnings(data as Earning[])

        // Calculate stats
        const totalEarnings = data.reduce((sum, item) => sum + item.amount, 0)
        const pendingAmount = data
          .filter((item) => item.status === "pending")
          .reduce((sum, item) => sum + item.amount, 0)
        const paidAmount = data.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0)
        const totalDeliveries = data.length

        setStats({
          totalEarnings,
          pendingAmount,
          paidAmount,
          totalDeliveries,
        })
      } catch (error: any) {
        console.error("Error fetching earnings:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [supabase])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  // Filter earnings based on active tab
  const filteredEarnings = earnings.filter((earning) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return earning.status === "pending"
    if (activeTab === "paid") return earning.status === "paid"
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Earnings</h2>
        <p className="text-muted-foreground">Track your delivery earnings and payouts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalDeliveries} total deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.paidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Already paid out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sunday</div>
            <p className="text-xs text-muted-foreground">Weekly payout schedule</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Earnings</TabsTrigger>
          <TabsTrigger value="pending">Pending ({earnings.filter((e) => e.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({earnings.filter((e) => e.status === "paid").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredEarnings.length === 0 ? (
            <div className="text-center py-12">
              <IndianRupee className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Earnings Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have any {activeTab !== "all" ? activeTab : ""} earnings yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 font-medium border-b">
                <div>Date</div>
                <div>Order ID</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Payout Date</div>
              </div>
              <div className="divide-y">
                {filteredEarnings.map((earning) => (
                  <div key={earning.id} className="grid grid-cols-5 p-4 text-sm">
                    <div>{formatDate(earning.created_at)}</div>
                    <div>#{earning.order_id.substring(0, 8)}</div>
                    <div>₹{earning.amount.toFixed(2)}</div>
                    <div>{getStatusBadge(earning.status)}</div>
                    <div>{earning.paid_at ? formatDate(earning.paid_at) : "Pending"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Earnings Report
        </Button>
      </div>
    </div>
  )
}
