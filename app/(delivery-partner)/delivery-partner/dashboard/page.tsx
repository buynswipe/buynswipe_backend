import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, Clock, MapPin } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DeliveryPartnerDashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  try {
    // Get delivery partner info
    const { data: partner, error: partnerError } = await supabase
      .from("delivery_partners")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (partnerError) {
      console.error("Error fetching delivery partner:", partnerError)
    }

    // Use partner ID or fallback for development
    const partnerId = partner?.id || "dev-partner-id"

    // Get delivery statistics
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("orders")
      .select("*")
      .eq("delivery_partner_id", partnerId)

    if (deliveriesError) {
      console.error("Error fetching deliveries:", deliveriesError)
    }

    // Calculate statistics
    const totalDeliveries = deliveries?.length || 0
    const completedDeliveries = deliveries?.filter((d) => d.status === "delivered").length || 0
    const activeDeliveries =
      deliveries?.filter((d) => ["dispatched", "in_transit", "out_for_delivery"].includes(d.status)).length || 0

    // Get recent deliveries
    const recentDeliveries = deliveries?.slice(0, 5) || []

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {partner?.name || session.user.email}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeliveries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDeliveries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedDeliveries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent deliveries found.</p>
            ) : (
              <div className="space-y-4">
                {recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Order #{delivery.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={delivery.status === "delivered" ? "default" : "secondary"}>
                        {delivery.status}
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/delivery-partner/tracking/${delivery.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild size="lg">
            <Link href="/delivery-partner/my-deliveries">View All Deliveries</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/delivery-partner/profile">Update Profile</Link>
          </Button>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in DeliveryPartnerDashboard:", error)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">There was an error loading your dashboard. Please try again.</p>
            <Button>
              <Link href="/delivery-partner/dashboard">Retry</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
