"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DeliveryAssignmentMonitorProps {
  orderId?: string
}

export function DeliveryAssignmentMonitor({ orderId }: DeliveryAssignmentMonitorProps) {
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [orderNotifications, setOrderNotifications] = useState<any[]>([])
  const [deliveryPartnerNotifications, setDeliveryPartnerNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle")

  const supabase = createClientComponentClient()

  async function checkDeliveryAssignment() {
    try {
      setIsLoading(true)
      setError(null)
      setStatus("checking")

      // This function checks the entire delivery assignment flow

      // 1. First, check if the order exists and has a delivery_partner_id
      if (!orderId) {
        throw new Error("No order ID provided")
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, status, delivery_partner_id, retailer_id, created_at")
        .eq("id", orderId)
        .single()

      if (orderError) {
        throw new Error(`Order not found: ${orderError.message}`)
      }

      if (!order.delivery_partner_id) {
        throw new Error("Order does not have a delivery partner assigned")
      }

      setOrderDetails(order)

      // 2. Check if the delivery partner exists and is linked to a user
      const { data: deliveryPartner, error: dpError } = await supabase
        .from("delivery_partners")
        .select("id, user_id, name")
        .eq("id", order.delivery_partner_id)
        .single()

      if (dpError) {
        throw new Error(`Delivery partner not found: ${dpError.message}`)
      }

      if (!deliveryPartner.user_id) {
        throw new Error("Delivery partner is not linked to a user account")
      }

      // 3. Check for notifications
      // For the order's retailer
      const { data: retailerNotifications, error: rnError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", order.retailer_id)
        .eq("related_entity_id", orderId)
        .order("created_at", { ascending: false })

      if (rnError) {
        console.error("Error fetching retailer notifications:", rnError)
        // Not throwing here, just logging, as this isn't critical
      }

      setOrderNotifications(retailerNotifications || [])

      // For the delivery partner
      const { data: dpNotifications, error: dpnError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", deliveryPartner.user_id)
        .eq("related_entity_id", orderId)
        .order("created_at", { ascending: false })

      if (dpnError) {
        console.error("Error fetching delivery partner notifications:", dpnError)
        // Not throwing here, just logging, as this isn't critical
      }

      setDeliveryPartnerNotifications(dpNotifications || [])

      // All checks passed
      setStatus("success")
    } catch (err: any) {
      console.error("Error checking delivery assignment:", err)
      setError(err.message || "Unknown error")
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Delivery Assignment Monitor</span>
          {status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
        <CardDescription>Check if delivery assignment is working correctly for an order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" && !orderId && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Enter an order ID</AlertTitle>
            <AlertDescription>Enter an order ID to check if delivery assignment is working correctly</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {orderDetails && (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Order Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Order ID:</div>
                <div>{orderDetails.id}</div>
                <div className="font-medium">Status:</div>
                <div>
                  <Badge>{orderDetails.status}</Badge>
                </div>
                <div className="font-medium">Delivery Partner ID:</div>
                <div>{orderDetails.delivery_partner_id}</div>
                <div className="font-medium">Created At:</div>
                <div>{new Date(orderDetails.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Retailer Notifications</h3>
              {orderNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications found for the retailer</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {orderNotifications.map((notification) => (
                    <li key={notification.id} className="p-2 border rounded-md">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Delivery Partner Notifications</h3>
              {deliveryPartnerNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications found for the delivery partner</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {deliveryPartnerNotifications.map((notification) => (
                    <li key={notification.id} className="p-2 border rounded-md">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkDeliveryAssignment} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Delivery Assignment"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
