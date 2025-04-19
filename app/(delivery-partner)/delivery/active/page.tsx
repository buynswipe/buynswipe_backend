import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Truck, MapPin, Package, User } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ActiveDeliveriesPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <div>Please log in to access this page</div>
  }

  // Get delivery partner info
  const { data: partner } = await supabase.from("delivery_partners").select("*").eq("user_id", session.user.id).single()

  // Get active deliveries
  const { data: activeDeliveries } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode),
      wholesaler:wholesaler_id(business_name, address, city, pincode)
    `)
    .eq("delivery_partner_id", partner?.id || "")
    .in("status", ["dispatched"])
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Active Deliveries</h1>
        <p className="text-muted-foreground">Manage your ongoing deliveries.</p>
      </div>

      {!activeDeliveries || activeDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No active deliveries</h2>
          <p className="text-muted-foreground">You don't have any active deliveries at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDeliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <h3 className="font-medium">Order #{delivery.id.substring(0, 8)}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        From: {delivery.wholesaler?.business_name || "Unknown Wholesaler"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">To: {delivery.retailer?.business_name || "Unknown Retailer"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Delivery Address: {delivery.retailer?.address}, {delivery.retailer?.city},{" "}
                      {delivery.retailer?.pincode}
                    </div>
                    <div className="text-sm font-medium">Payment Method: {delivery.payment_method.toUpperCase()}</div>
                    <div className="text-sm font-medium">Amount: ₹{delivery.total_amount.toFixed(2)}</div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end justify-center">
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                    </div>
                    <Button asChild className="mt-2">
                      <Link href={`/delivery/tracking/${delivery.id}`}>
                        <Truck className="mr-2 h-4 w-4" />
                        Manage Delivery
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
