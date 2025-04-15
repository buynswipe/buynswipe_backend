import { createServerSupabaseClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Truck, Package, MapPin, User, Phone, CreditCard, CheckCircle, Clock } from "lucide-react"
import { DeliveryStatusUpdate } from "@/components/delivery-partner/delivery-status-update"
import { DeliveryProofForm } from "@/components/delivery-partner/delivery-proof-form"
import { CodCollectionForm } from "@/components/delivery-partner/cod-collection-form"

interface DeliveryTrackingPageProps {
  params: {
    id: string
  }
}

export const dynamic = "force-dynamic"

export default async function DeliveryTrackingPage({ params }: DeliveryTrackingPageProps) {
  const { id } = params
  const supabase = createServerSupabaseClient()

  // Get order details
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode, phone, email),
      wholesaler:wholesaler_id(business_name, address, city, pincode, phone, email),
      items:order_items(*, product:product_id(*))
    `)
    .eq("id", id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Get delivery status updates
  const { data: statusUpdates } = await supabase
    .from("delivery_status_updates")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true })

  // Get delivery proof
  const { data: deliveryProof } = await supabase.from("delivery_proofs").select("*").eq("order_id", id).maybeSingle()

  const isDelivered = order.status === "delivered"
  const isCod = order.payment_method === "cod"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Tracking</h1>
        <p className="text-muted-foreground">
          Order #{id.substring(0, 8)} • {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Order ID: #{id.substring(0, 8)}</p>
                    <p>Created: {new Date(order.created_at).toLocaleString()}</p>
                    <p>Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                    <p>Payment Method: {order.payment_method.toUpperCase()}</p>
                    <p>
                      Payment Status: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </p>
                    <p>Total Amount: ₹{order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Delivery Information
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Retailer: {order.retailer?.business_name}</p>
                    <p>Address: {order.retailer?.address}</p>
                    <p>
                      City: {order.retailer?.city}, {order.retailer?.pincode}
                    </p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <p>{order.retailer?.phone}</p>
                    </div>
                    <p>Wholesaler: {order.wholesaler?.business_name}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isDelivered && <DeliveryStatusUpdate orderId={id} currentStatus={order.status} />}

          {order.status === "dispatched" && !deliveryProof && <DeliveryProofForm orderId={id} isCod={isCod} />}

          {isCod && order.status === "delivered" && order.payment_status === "pending" && (
            <CodCollectionForm orderId={id} amount={order.total_amount} />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusUpdates?.map((update) => (
                  <div key={update.id} className="flex items-start gap-2">
                    {update.status === "assigned" && <Truck className="h-4 w-4 mt-0.5 text-blue-500" />}
                    {update.status === "picked_up" && <Package className="h-4 w-4 mt-0.5 text-orange-500" />}
                    {update.status === "in_transit" && <MapPin className="h-4 w-4 mt-0.5 text-purple-500" />}
                    {update.status === "delivered" && <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />}
                    {update && <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />}
                    {update.status === "failed" && <Clock className="h-4 w-4 mt-0.5 text-red-500" />}
                    <div>
                      <p className="font-medium">
                        {update.status.charAt(0).toUpperCase() + update.status.slice(1).replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(update.created_at).toLocaleString()}</p>
                      {update.notes && <p className="text-sm mt-1">{update.notes}</p>}
                    </div>
                  </div>
                ))}

                {(!statusUpdates || statusUpdates.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No status updates yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{order.payment_method.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span
                    className={`font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
                </div>

                {isCod && order.status === "delivered" && order.payment_status === "pending" && (
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <a href="#cod-collection">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Collect Payment
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {deliveryProof && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Proof</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">Received by: {deliveryProof.receiver_name}</p>
                  <p className="text-sm">Date: {new Date(deliveryProof.created_at).toLocaleString()}</p>

                  {deliveryProof.photo_url && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Photo:</p>
                      <img
                        src={deliveryProof.photo_url || "/placeholder.svg"}
                        alt="Delivery proof"
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  )}

                  {deliveryProof.signature_url && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Signature:</p>
                      <img
                        src={deliveryProof.signature_url || "/placeholder.svg"}
                        alt="Signature"
                        className="w-full h-auto rounded-md bg-gray-50"
                      />
                    </div>
                  )}

                  {deliveryProof.notes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm">{deliveryProof.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
