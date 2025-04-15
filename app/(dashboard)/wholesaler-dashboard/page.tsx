import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Store, Truck, DollarSign, Clock, BarChart, ShoppingCart, Package } from "lucide-react"

export default async function MainDashboardPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/login")
  }

  // Double-check: Redirect users to appropriate dashboards
  if (profile.role === "delivery_partner") {
    redirect("/delivery-partner/dashboard")
  } else if (profile.role === "wholesaler") {
    redirect("/wholesaler-dashboard")
  }

  // ADMIN DASHBOARD
  if (profile.role === "admin") {
    // Fetch data for admin dashboard
    const { data: orders } = await supabase.from("orders").select("status")

    const { data: wholesalers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "wholesaler")
      .eq("is_approved", true)

    const { data: retailers } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "retailer")
      .eq("is_approved", true)

    const { data: pendingApprovals } = await supabase.from("profiles").select("id").eq("is_approved", false)

    // Calculate metrics
    const totalOrders = orders?.length || 0
    const confirmedOrders = orders?.filter((o) => o.status === "confirmed").length || 0
    const dispatchedOrders = orders?.filter((o) => o.status === "dispatched").length || 0
    const wholesalerCount = wholesalers?.length || 0
    const retailerCount = retailers?.length || 0
    const pendingApprovalCount = pendingApprovals?.length || 0

    // Calculate total revenue
    const { data: revenueData } = await supabase.from("orders").select("total_amount").eq("payment_status", "paid")

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    // Define metrics for the Recent Activity card
    const metrics = {
      pendingOrders: orders?.filter((o) => o.status === "placed").length || 0,
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, Retail Bandhu Admin</h2>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Retailers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retailerCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wholesalers</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wholesalerCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Partners</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/delivery-partners">
                  <Truck className="mr-2 h-4 w-4" />
                  Manage Delivery Partners
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/transactions">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Transactions
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent activity on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // RETAILER DASHBOARD
  if (profile.role === "retailer") {
    // Fetch data for retailer dashboard
    const { data: orders } = await supabase.from("orders").select("status").eq("retailer_id", session.user.id)

    // Calculate metrics
    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter((o) => o.status === "placed").length || 0
    const confirmedOrders = orders?.filter((o) => o.status === "confirmed").length || 0
    const dispatchedOrders = orders?.filter((o) => o.status === "dispatched").length || 0

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, created_at, status, total_amount")
      .eq("retailer_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {profile.business_name || "Retailer"}</h2>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispatched Orders</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dispatchedOrders}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View My Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/wholesalers">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Wholesalers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your recent order activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Order #{order.id.substring(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">₹{order.total_amount?.toFixed(2) || "0.00"}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No recent orders found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}
