"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  pendingOrders: number
  deliveryPartners: number
  totalRevenue: number
  monthlyGrowth: number
}

interface RecentActivity {
  id: string
  type: "order" | "product" | "delivery" | "payment"
  title: string
  description: string
  timestamp: string
  status: "pending" | "completed" | "warning" | "error"
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDashboardData()
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch dashboard statistics
      const statsResponse = await fetch("/api/dashboard/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Fetch recent activities
      const activitiesResponse = await fetch("/api/dashboard/activities")
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setActivities(activitiesData.activities)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set mock data for demo
      setStats({
        totalProducts: 9,
        lowStockProducts: 1,
        pendingOrders: 3,
        deliveryPartners: 0,
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
      })
      setActivities([
        {
          id: "1",
          type: "product",
          title: "Update your product inventory",
          description: "2 products are running low on stock",
          timestamp: "2 hours ago",
          status: "warning",
        },
        {
          id: "2",
          type: "order",
          title: "Process new orders (3)",
          description: "3 new orders received today",
          timestamp: "4 hours ago",
          status: "pending",
        },
        {
          id: "3",
          type: "delivery",
          title: "Manage delivery partners",
          description: "No active delivery partners",
          timestamp: "1 day ago",
          status: "error",
        },
        {
          id: "4",
          type: "order",
          title: "Track sales performance",
          description: "Monthly sales increased by 12.5%",
          timestamp: "2 days ago",
          status: "completed",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getWelcomeMessage = () => {
    if (!userProfile) return "Welcome to Retail Bandhu"

    const businessName = userProfile.business_name || userProfile.full_name || "User"
    const role = userProfile.role

    switch (role) {
      case "wholesaler":
        return `Welcome, ${businessName}`
      case "retailer":
        return `Welcome, ${businessName}`
      case "delivery_partner":
        return `Welcome, ${userProfile.full_name || "Delivery Partner"}`
      case "admin":
        return `Welcome, Admin`
      default:
        return `Welcome, ${businessName}`
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "product":
        return <Package className="h-4 w-4" />
      case "delivery":
        return <Truck className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <h2 className="text-xl text-muted-foreground">{getWelcomeMessage()}</h2>
          <p className="text-muted-foreground">{"Here's what's happening with your account today."}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Active products in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.lowStockProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Partners</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deliveryPartners || 0}</div>
            <p className="text-xs text-muted-foreground">Active partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="default" onClick={() => router.push("/manage-products")}>
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push("/order-management")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Manage Orders
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push("/delivery-partners")}
            >
              <Truck className="mr-2 h-4 w-4" />
              Manage Delivery Partners
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push("/inventory-alerts")}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              View Inventory Alerts
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent activity on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <Badge className={getStatusColor(activity.status)} variant="secondary">
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      {stats?.totalRevenue && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your business performance this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total revenue this month</p>
              </div>
              <div className="flex items-center space-x-2">
                {stats.monthlyGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${stats.monthlyGrowth > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.monthlyGrowth > 0 ? "+" : ""}
                  {stats.monthlyGrowth}%
                </span>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
