"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsData {
  revenue: {
    total: number
    growth: number
    trend: "up" | "down"
    monthly: Array<{ month: string; amount: number }>
  }
  orders: {
    total: number
    pending: number
    completed: number
    growth: number
    daily: Array<{ date: string; orders: number }>
  }
  inventory: {
    totalProducts: number
    lowStock: number
    outOfStock: number
    topProducts: Array<{ name: string; sales: number; revenue: number }>
  }
  customers: {
    total: number
    active: number
    new: number
    retention: number
  }
}

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration - replace with real API calls
      const mockData: AnalyticsData = {
        revenue: {
          total: 2847500,
          growth: 12.5,
          trend: "up",
          monthly: [
            { month: "Jan", amount: 185000 },
            { month: "Feb", amount: 220000 },
            { month: "Mar", amount: 275000 },
            { month: "Apr", amount: 310000 },
            { month: "May", amount: 285000 },
            { month: "Jun", amount: 340000 },
          ],
        },
        orders: {
          total: 1247,
          pending: 23,
          completed: 1189,
          growth: 8.3,
          daily: [
            { date: "2024-01-01", orders: 45 },
            { date: "2024-01-02", orders: 52 },
            { date: "2024-01-03", orders: 38 },
            { date: "2024-01-04", orders: 61 },
            { date: "2024-01-05", orders: 49 },
            { date: "2024-01-06", orders: 55 },
            { date: "2024-01-07", orders: 67 },
          ],
        },
        inventory: {
          totalProducts: 1456,
          lowStock: 23,
          outOfStock: 5,
          topProducts: [
            { name: "Premium Rice 25kg", sales: 234, revenue: 175500 },
            { name: "Cooking Oil 5L", sales: 189, revenue: 94500 },
            { name: "Wheat Flour 10kg", sales: 156, revenue: 62400 },
            { name: "Sugar 1kg", sales: 298, revenue: 89400 },
            { name: "Tea Powder 500g", sales: 167, revenue: 50100 },
          ],
        },
        customers: {
          total: 892,
          active: 634,
          new: 47,
          retention: 78.5,
        },
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setData(mockData)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num)
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into your business performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full">
        <TabsList>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
          <TabsTrigger value="90d">90 Days</TabsTrigger>
          <TabsTrigger value="1y">1 Year</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {data.revenue.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={data.revenue.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {data.revenue.growth}%
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.orders.total)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{data.orders.growth}%</span>
                  <span className="ml-1">from last month</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{data.orders.pending} Pending</Badge>
                  <Badge variant="default">{data.orders.completed} Completed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.customers.active)}</div>
                <div className="text-xs text-muted-foreground">{data.customers.new} new this month</div>
                <div className="mt-2">
                  <Badge variant="outline">{data.customers.retention}% Retention</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.inventory.totalProducts)}</div>
                <div className="text-xs text-muted-foreground">Total Products</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive">{data.inventory.outOfStock} Out of Stock</Badge>
                  <Badge variant="secondary">{data.inventory.lowStock} Low Stock</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.orders.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.inventory.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
