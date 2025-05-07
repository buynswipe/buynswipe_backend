import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, MapPin, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function MyDeliveriesPage() {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return <div>Please log in to access this page</div>
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get delivery partner info
  const { data: partner } = await supabase.from("delivery_partners").select("*").eq("user_id", session.user.id).single()

  // Get assigned orders
  const { data: deliveries } = await supabase
    .from("orders")
    .select(`
     *,
     retailer:retailer_id(business_name, address, city, pincode),
     wholesaler:wholesaler_id(business_name, address, city, pincode)
   `)
    .eq("delivery_partner_id", partner?.id || "")
    .in("status", ["confirmed", "dispatched", "in_transit"])
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="outline">Confirmed</Badge>
      case "dispatched":
        return <Badge variant="secondary">Dispatched</Badge>
      case "in_transit":
        return <Badge variant="default">In Transit</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
        <p className="text-muted-foreground">Track and manage your assigned deliveries</p>
      </div>

      {!deliveries || deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No active deliveries</h2>
            <p className="text-muted-foreground">You don't have any active deliveries assigned to you at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Order #{delivery.id.substring(0, 8)}</CardTitle>
                  {getStatusBadge(delivery.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{delivery.retailer?.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.retailer?.address}, {delivery.retailer?.city}, {delivery.retailer?.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{new Date(delivery.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/delivery/tracking/${delivery.id}`}>
                    Track Delivery
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
