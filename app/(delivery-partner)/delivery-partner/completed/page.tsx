import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, MapPin, Package, User, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CompletedDeliveriesPage() {
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

  // Get completed deliveries
  const { data: completedDeliveries } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode),
      wholesaler:wholesaler_id(business_name, address, city, pincode)
    `)
    .eq("delivery_partner_id", partner?.id || "")
    .eq("status", "delivered")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Completed Deliveries</h1>
        <p className="text-muted-foreground">View your delivery history.</p>
      </div>

      {!completedDeliveries || completedDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No completed deliveries</h2>
          <p className="text-muted-foreground">You haven't completed any deliveries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedDeliveries.map((delivery) => (
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
                    <div className="text-sm font-medium">Payment Method: {delivery.payment_method.toUpperCase()}</div>
                    <div className="text-sm font-medium">Amount: ₹{delivery.total_amount.toFixed(2)}</div>
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
