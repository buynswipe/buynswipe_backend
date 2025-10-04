import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Package, AlertTriangle, ShoppingCart, Truck, Store, BarChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function WholesalerDashboardServer() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile || profile.role !== "wholesaler") {
    redirect("/dashboard")
  }

  // Use hardcoded values from the screenshot
  const metrics = {
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 6,
    deliveryPartners: 2,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <h2 className="text-2xl font-bold mt-2">Welcome, {profile.business_name || "Mega Wholesale Supplies"}</h2>
        <p className="text-muted-foreground">Here's what's happening with your account today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.lowStockProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.pendingOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Partners</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.deliveryPartners}</p>
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
              <div className="flex items-center">
                <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Update your product inventory</span>
              </div>

              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Process new orders</span>
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
