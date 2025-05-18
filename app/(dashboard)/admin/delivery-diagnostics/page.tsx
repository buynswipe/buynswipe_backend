"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DeliveryDiagnosticsPage() {
  const [orderId, setOrderId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const runDiagnostics = async () => {
    if (!orderId) return

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      // 1. Check if order exists
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*, retailer:retailer_id(*), wholesaler:wholesaler_id(*)")
        .eq("id", orderId)
        .single()

      if (orderError) {
        throw new Error(`Order not found: ${orderError.message}`)
      }

      // 2. Check delivery partner assignment
      const deliveryPartnerId = order.delivery_partner_id
      let deliveryPartner = null
      let deliveryPartnerUser = null

      if (!deliveryPartnerId) {
        throw new Error("No delivery partner assigned to this order")
      }

      // 3. Get delivery partner details
      const { data: partner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("*")
        .eq("id", deliveryPartnerId)
        .single()

      if (partnerError) {
        throw new Error(`Delivery partner not found: ${partnerError.message}`)
      }

      deliveryPartner = partner

      // 4. Check if delivery partner is linked to a user
      if (!partner.user_id) {
        throw new Error("Delivery partner is not linked to a user account")
      }

      // 5. Get delivery partner user
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", partner.user_id)
        .single()

      if (userError) {
        throw new Error(`Delivery partner user not found: ${userError.message}`)
      }

      deliveryPartnerUser = user

      // 6. Check notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("related_entity_id", orderId)
        .order("created_at", { ascending: false })

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError)
      }

      // 7. Compile results
      setResults({
        order,
        deliveryPartner,
        deliveryPartnerUser,
        notifications: notifications || [],
        timestamp: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error("Diagnostics error:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Diagnostics</h1>
        <p className="text-muted-foreground">Troubleshoot delivery partner assignment issues</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Diagnostics</CardTitle>
          <CardDescription>Enter an order ID to check its delivery assignment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <Button onClick={runDiagnostics} disabled={isLoading || !orderId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Diagnostics"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Order ID:</div>
                  <div>{results.order.id}</div>

                  <div className="font-medium">Status:</div>
                  <div>{results.order.status}</div>

                  <div className="font-medium">Created At:</div>
                  <div>{new Date(results.order.created_at).toLocaleString()}</div>

                  <div className="font-medium">Retailer:</div>
                  <div>{results.order.retailer?.business_name}</div>

                  <div className="font-medium">Wholesaler:</div>
                  <div>{results.order.wholesaler?.business_name}</div>

                  <div className="font-medium">Delivery Partner ID:</div>
                  <div>{results.order.delivery_partner_id}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Partner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Name:</div>
                  <div>{results.deliveryPartner.name}</div>

                  <div className="font-medium">Phone:</div>
                  <div>{results.deliveryPartner.phone}</div>

                  <div className="font-medium">Vehicle:</div>
                  <div>
                    {results.deliveryPartner.vehicle_type} - {results.deliveryPartner.vehicle_number}
                  </div>

                  <div className="font-medium">User ID:</div>
                  <div>{results.deliveryPartner.user_id}</div>

                  <div className="font-medium">Is Active:</div>
                  <div>{results.deliveryPartner.is_active ? "Yes" : "No"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {results.notifications.length === 0 ? (
                <p>No notifications found for this order</p>
              ) : (
                <div className="space-y-4">
                  {results.notifications.map((notification: any) => (
                    <div key={notification.id} className="border p-3 rounded-md">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Sent to: {notification.user_id} •{new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {results.order.delivery_partner_id ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Delivery partner assigned to order</span>
                </div>

                <div className="flex items-center gap-2">
                  {results.deliveryPartner.user_id ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Delivery partner linked to user account</span>
                </div>

                <div className="flex items-center gap-2">
                  {results.deliveryPartner.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Delivery partner is active</span>
                </div>

                <div className="flex items-center gap-2">
                  {results.notifications.some((n: any) => n.user_id === results.deliveryPartner.user_id) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Notifications sent to delivery partner</span>
                </div>

                <div className="flex items-center gap-2">
                  {["confirmed", "dispatched", "in_transit", "out_for_delivery"].includes(results.order.status) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Order status is valid for delivery ({results.order.status})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
