import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Store, ShoppingCart, Clock, AlertTriangle, Truck, BarChart3, Settings, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user session
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

  // Fetch counts based on user role
  let retailerCount = 0
  let wholesalerCount = 0
  let pendingApprovalCount = 0
  let deliveryPartnerCount = 0
  let totalRevenue = 0

  if (profile.role === "admin") {
    // Fetch retailer count
    const { count: rCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "retailer")
    retailerCount = rCount || 0

    // Fetch wholesaler count
    const { count: wCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "wholesaler")
    wholesalerCount = wCount || 0

    // Fetch pending approval count
    const { count: pCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false)
    pendingApprovalCount = pCount || 0

    // Fetch delivery partner count
    const { count: dCount } = await supabase
      .from("delivery_partners")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
    deliveryPartnerCount = dCount || 0

    // Fetch total revenue
    const { data: transactions } = await supabase.from("transactions").select("amount").eq("status", "completed")
    totalRevenue = transactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">
          Welcome, {profile.role === "admin" ? "Retail Bandhu Admin" : profile.business_name}
        </h1>
        {profile.role === "admin" && (
          <Button asChild>
            <Link href="/setup">
              <Settings className="mr-2 h-4 w-4" />
              System Setup
            </Link>
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mb-8">Here's what's happening with your account today.</p>

      {profile.role === "admin" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <div className="text-2xl font-bold">{deliveryPartnerCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Overall platform revenue from all transactions</CardDescription>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you can perform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
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
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Transactions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/setup">
                    <Settings className="mr-2 h-4 w-4" />
                    System Setup
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Approve new user registrations</p>
                    <p className="text-xs text-muted-foreground">Manage pending approval requests</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Monitor delivery partner activity</p>
                    <p className="text-xs text-muted-foreground">Track delivery partner performance</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Track platform transactions</p>
                    <p className="text-xs text-muted-foreground">Monitor financial activity</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/transactions">View All Activity</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}

      {/* Retailer Dashboard */}
      {profile.role === "retailer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/wholesalers">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Wholesalers
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/products">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Browse Products
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
              {/* Recent orders would go here */}
              <div className="text-center py-6 text-muted-foreground">
                <p>No recent orders to display.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Wholesaler Dashboard */}
      {profile.role === "wholesaler" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/order-management">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Manage Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/products">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Manage Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/inventory-alerts">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Inventory Alerts
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Recent orders from retailers.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Recent orders would go here */}
              <div className="text-center py-6 text-muted-foreground">
                <p>No recent orders to display.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/order-management">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Delivery Partner Dashboard */}
      {profile.role === "delivery_partner" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/delivery/tracking">
                  <Truck className="mr-2 h-4 w-4" />
                  View Assigned Deliveries
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
              <CardTitle>Delivery Statistics</CardTitle>
              <CardDescription>Your delivery performance.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Delivery stats would go here */}
              <div className="text-center py-6 text-muted-foreground">
                <p>No delivery statistics to display.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
