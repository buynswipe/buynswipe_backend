"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Package, ShoppingCart, CreditCard, Users, AlertTriangle } from "lucide-react"

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalProducts: number
  recentOrders: Array<{
    id: string
    status: string
    total_amount: number
    created_at: string
    wholesaler: {
      business_name: string
    }
  }>
}

// Cache for dashboard data
const dashboardCache = new Map<string, { data: DashboardStats; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Memoized stat card component
const StatCard = memo(
  ({
    title,
    value,
    icon: Icon,
    trend,
    className = "",
  }: {
    title: string
    value: string | number
    icon: any
    trend?: string
    className?: string
  }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>
  ),
)

// Memoized recent orders component
const RecentOrdersList = memo(({ orders }: { orders: DashboardStats["recentOrders"] }) => {
  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })
  }, [])

  const getStatusColor = useCallback((status: string) => {
    const colors = {
      placed: "text-blue-600",
      confirmed: "text-green-600",
      dispatched: "text-purple-600",
      delivered: "text-green-600",
      rejected: "text-red-600",
    }
    return colors[status as keyof typeof colors] || "text-gray-600"
  }, [])

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">#{order.id.substring(0, 8)}</p>
            <p className="text-sm text-gray-600">{order.wholesaler.business_name}</p>
            <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
            <p className={`text-sm capitalize ${getStatusColor(order.status)}`}>{order.status}</p>
          </div>
        </div>
      ))}
    </div>
  )
})

import { memo } from "react"

export function OptimizedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Memoized stats calculations
  const formattedStats = useMemo(() => {
    if (!stats) return null

    return {
      totalOrders: stats.totalOrders.toLocaleString(),
      pendingOrders: stats.pendingOrders.toLocaleString(),
      totalRevenue: `₹${stats.totalRevenue.toLocaleString()}`,
      totalProducts: stats.totalProducts.toLocaleString(),
    }
  }, [stats])

  const loadDashboardData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Not authenticated")
        return
      }

      const userId = session.user.id
      const cacheKey = `dashboard_${userId}`
      const cached = dashboardCache.get(cacheKey)

      // Return cached data if still valid
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setStats(cached.data)
        setLoading(false)
        return
      }

      setLoading(true)

      // Parallel queries for better performance
      const [ordersResult, productsResult, recentOrdersResult] = await Promise.allSettled([
        // Total and pending orders
        supabase
          .from("orders")
          .select("status, total_amount")
          .eq("retailer_id", userId),

        // Total products (if user is wholesaler)
        supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("wholesaler_id", userId),

        // Recent orders
        supabase
          .from("orders")
          .select(`
            id,
            status,
            total_amount,
            created_at,
            wholesaler:profiles!orders_wholesaler_id_fkey(business_name)
          `)
          .eq("retailer_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      // Process results
      let totalOrders = 0
      let pendingOrders = 0
      let totalRevenue = 0
      let totalProducts = 0
      let recentOrders: DashboardStats["recentOrders"] = []

      if (ordersResult.status === "fulfilled" && ordersResult.value.data) {
        const orders = ordersResult.value.data
        totalOrders = orders.length
        pendingOrders = orders.filter((o) => o.status === "placed" || o.status === "confirmed").length
        totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      }

      if (productsResult.status === "fulfilled" && productsResult.value.count !== null) {
        totalProducts = productsResult.value.count
      }

      if (recentOrdersResult.status === "fulfilled" && recentOrdersResult.value.data) {
        recentOrders = recentOrdersResult.value.data as DashboardStats["recentOrders"]
      }

      const dashboardData: DashboardStats = {
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
        recentOrders,
      }

      // Cache the results
      dashboardCache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now(),
      })

      setStats(dashboardData)
    } catch (err) {
      console.error("Error loading dashboard:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats || !formattedStats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No dashboard data available</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={formattedStats.totalOrders}
          icon={ShoppingCart}
          trend="+12% from last month"
        />
        <StatCard
          title="Pending Orders"
          value={formattedStats.pendingOrders}
          icon={Package}
          trend="Needs attention"
          className={stats.pendingOrders > 0 ? "border-yellow-200" : ""}
        />
        <StatCard
          title="Total Revenue"
          value={formattedStats.totalRevenue}
          icon={CreditCard}
          trend="+8% from last month"
        />
        <StatCard title="Products" value={formattedStats.totalProducts} icon={Users} trend="Active products" />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ? (
            <RecentOrdersList orders={stats.recentOrders} />
          ) : (
            <p className="text-center text-gray-500 py-8">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
