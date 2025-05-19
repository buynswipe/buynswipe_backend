import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Truck, MapPin, Package, User } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ActiveDeliveriesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get delivery partner info
  const { data: partner, error: partnerError } = await supabase
    .from("delivery_partners")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (partnerError && !partnerError.message.includes("No rows found")) {
    console.error("Error fetching delivery partner:", partnerError)
  }

  // If no partner found, create sample data for development
  const partnerId = partner?.id || "dev-partner-id"

  // Get active deliveries
  const { data: activeData, error: activeError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode, phone),
      wholesaler:wholesaler_id(business_name)
    `)
    .eq("delivery_partner_id", partnerId)
    .in("status", ["dispatched", "in_transit", "out_for_delivery"])
    .order("created_at", { ascending: false })

  if (activeError) {
    console.error("Error fetching active deliveries:", activeError)
  }

  // Create sample data if no real data exists
  const activeDeliveries = activeData || []
  const useSampleData = activeDeliveries.length === 0

  const sampleActiveDeliveries = [
    {
      id: "2abb2968-29ab-46d7-bfb1-a47640e5027f",
      created_at: new Date().toISOString(),
      status: "dispatched",
      total_amount: 60.0,
      payment_method: "cod",
      retailer: {
        business_name: "Sample Retail Store",
        address: "123 Retail Street",
        city: "Delhi",
        pincode: "110001",
        phone: "9876543211",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
    {
      id: "cb40debd-9c0f-434d-a401-8b8915d8e4ea",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: "in_transit",
      total_amount: 120.0,
      payment_method: "cod",
      retailer: {
        business_name: "City Retail Shop",
        address: "456 Market Road",
        city: "Mumbai",
        pincode: "400001",
        phone: "9876543222",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
  ]

  const displayDeliveries = useSampleData ? sampleActiveDeliveries : activeDeliveries

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Active Deliveries</h1>
        <p className="text-muted-foreground">Manage your ongoing deliveries.</p>
      </div>

      {useSampleData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            <strong>Development Mode:</strong> Showing sample data because no real deliveries are assigned to this
            partner.
          </p>
        </div>
      )}

      {displayDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No active deliveries</h2>
          <p className="text-muted-foreground">You don't have any active deliveries at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayDeliveries.map((delivery) => (
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
                    <div className="text-sm font-medium">
                      Payment Method: {delivery.payment_method?.toUpperCase() || "COD"}
                    </div>
                    <div className="text-sm font-medium">Amount: ₹{delivery.total_amount?.toFixed(2) || "0.00"}</div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end justify-center">
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace("_", " ")}
                    </div>
                    <Button asChild className="mt-2">
                      <Link href={`/delivery-partner/tracking/${delivery.id}`}>
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
