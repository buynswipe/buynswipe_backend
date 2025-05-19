import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, MapPin, Package, User, Calendar } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CompletedDeliveriesPage() {
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

  // Get completed deliveries
  const { data: completedData, error: completedError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode, phone),
      wholesaler:wholesaler_id(business_name)
    `)
    .eq("delivery_partner_id", partnerId)
    .eq("status", "delivered")
    .order("created_at", { ascending: false })

  if (completedError) {
    console.error("Error fetching completed deliveries:", completedError)
  }

  // Create sample data if no real data exists
  const completedDeliveries = completedData || []
  const useSampleData = completedDeliveries.length === 0

  const sampleCompletedDeliveries = [
    {
      id: "3cdd3069-3a9c-47d8-bfc2-b58640e6028g",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 150000000).toISOString(), // A bit later than created
      status: "delivered",
      total_amount: 85.5,
      payment_method: "cod",
      retailer: {
        business_name: "Corner Store",
        address: "789 Main Street",
        city: "Bangalore",
        pincode: "560001",
        phone: "9876543233",
      },
      wholesaler: {
        business_name: "Mega Wholesale Supplies",
      },
    },
  ]

  const displayDeliveries = useSampleData ? sampleCompletedDeliveries : completedDeliveries

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Completed Deliveries</h1>
        <p className="text-muted-foreground">View your delivery history.</p>
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
          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No completed deliveries</h2>
          <p className="text-muted-foreground">You haven't completed any deliveries yet.</p>
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
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Delivered on: {new Date(delivery.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      Payment Method: {delivery.payment_method?.toUpperCase() || "COD"}
                    </div>
                    <div className="text-sm font-medium">Amount: ₹{delivery.total_amount?.toFixed(2) || "0.00"}</div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end justify-center">
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      Delivered
                    </div>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href={`/delivery-partner/tracking/${delivery.id}`}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        View Details
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
