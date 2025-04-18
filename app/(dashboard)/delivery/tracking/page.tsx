import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, MapPin, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DeliveryTrackingPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login")
  }

  // Check if user is a delivery partner
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (profileError || !profile || (profile.role !== "delivery_partner" && profile.role !== "admin")) {
    redirect("/")
  }

  // Fetch assigned orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(id, name, address, phone),
      wholesaler:wholesaler_id(id, name, address, phone)
    `)
    .eq("delivery_partner_id", session.user.id)
    .in("status", ["dispatched", "in_transit", "out_for_delivery"])
    .order("created_at", { ascending: false })

  // Fetch completed orders
  const { data: completedOrders, error: completedOrdersError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(id, name, address, phone),
      wholesaler:wholesaler_id(id, name, address, phone)
    `)
    .eq("delivery_partner_id", session.user.id)
    .eq("status", "delivered")
    .order("updated_at", { ascending: false })
    .limit(10)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "dispatched":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-yellow-100 text-yellow-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="completed">Completed Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {orders && orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                    <CardDescription>Created on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Delivery Address</p>
                          <p className="text-sm text-gray-500">{order.retailer.address || "No address provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Pickup From</p>
                          <p className="text-sm text-gray-500">{order.wholesaler.name}</p>
                          <p className="text-sm text-gray-500">{order.wholesaler.address || "No address provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Estimated Delivery</p>
                          <p className="text-sm text-gray-500">
                            {order.estimated_delivery
                              ? new Date(order.estimated_delivery).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button asChild className="w-full">
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No active deliveries</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any active deliveries at the moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedOrders && completedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </div>
                    <CardDescription>Delivered on {new Date(order.updated_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Delivered To</p>
                          <p className="text-sm text-gray-500">{order.retailer.name}</p>
                          <p className="text-sm text-gray-500">{order.retailer.address || "No address provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Picked Up From</p>
                          <p className="text-sm text-gray-500">{order.wholesaler.name}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No completed deliveries</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't completed any deliveries yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
