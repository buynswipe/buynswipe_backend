"use client"

import { useState, useEffect } from "react"
import { Package, AlertTriangle, ShoppingCart, Truck, Store, BarChart, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function WholesalerDashboardClient() {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    deliveryPartners: 0,
    businessName: "",
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      // Get user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      if (!profile) {
        throw new Error("Profile not found")
      }

      // Get total products count
      const { count: totalProducts, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("wholesaler_id", session.user.id)

      // Get low stock products count
      const { count: lowStockProducts, error: lowStockError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("wholesaler_id", session.user.id)
        .lt("stock_quantity", 10) // Assuming low stock is less than 10

      // Get pending orders count
      const { count: pendingOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("wholesaler_id", session.user.id)
        .eq("status", "placed")

      // Get delivery partners count
      const { count: deliveryPartners, error: partnersError } = await supabase
        .from("delivery_partners")
        .select("*", { count: "exact", head: true })
        .eq("wholesaler_id", session.user.id)
        .eq("is_active", true)

      setMetrics({
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        pendingOrders: pendingOrders || 0,
        deliveryPartners: deliveryPartners || 0,
        businessName: profile.business_name || "Wholesaler",
      })

      setLastUpdated(new Date())
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleManualRefresh = () => {
    fetchDashboardData()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <h2 className="text-2xl font-bold mt-2">Welcome, {metrics.businessName}</h2>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>
        <div className="flex flex-col items-end">
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={refreshing} className="mb-2">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold">{metrics.totalProducts}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold">{metrics.lowStockProducts}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold">{metrics.pendingOrders}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Partners</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold">{metrics.deliveryPartners}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Common tasks you can perform.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/products">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/order-management">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Manage Orders
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/delivery-partners">
                <Truck className="mr-2 h-4 w-4" />
                Manage Delivery Partners
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/inventory-alerts">
                <AlertTriangle className="mr-2 h-4 w-4" />
                View Inventory Alerts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Your recent activity on the platform.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Update your product inventory</span>
                  </div>

                  <div className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Process new orders ({metrics.pendingOrders})</span>
                  </div>

                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Manage delivery partners</span>
                  </div>

                  <div className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Track sales performance</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
