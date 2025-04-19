"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Truck, Package, CheckCircle, Clock, MapPin, Phone, IndianRupee, MessageSquare } from "lucide-react"
import Link from "next/link"
import { ProofOfDelivery } from "@/components/delivery/proof-of-delivery"
import { CODCollection } from "@/components/delivery/cod-collection"
import { useOrder } from "@/contexts/order-context"
import { useLocation } from "@/contexts/location-context"
import { useMessaging } from "@/contexts/messaging-context"
import { useNotifications } from "@/contexts/notification-context"

export default function DeliveryPartnerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active")
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false)
  const [showCODCollection, setShowCODCollection] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [showMessageForm, setShowMessageForm] = useState(false)

  const { orders, isLoading, error, fetchOrders, updateOrderStatus } = useOrder()
  const { currentLocation, isTracking, startTracking, updateOrderLocation } = useLocation()
  const { sendMessage } = useMessaging()
  const { notifications, unreadCount } = useNotifications()

  // Start location tracking on mount
  useEffect(() => {
    startTracking()
  }, [startTracking])

  // Filter orders by status
  const activeOrders = orders.filter((order) => order.status === "confirmed" || order.status === "dispatched")

  const pendingOrders = orders.filter((order) => order.status === "placed")

  const completedOrders = orders.filter((order) => order.status === "delivered")

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Handle order status update
  const handleUpdateStatus = async (order: any, status: string) => {
    if (!currentLocation) {
      alert("Location tracking is not available. Please enable location services.")
      return
    }

    // Update order location and status
    const success = await updateOrderLocation(order.id, status)

    if (success) {
      // Refresh orders
      fetchOrders()
    }
  }

  // Handle mark as picked up
  const handleMarkAsPickedUp = async (order: any) => {
    await handleUpdateStatus(order, "picked_up")
  }

  // Handle mark as in transit
  const handleMarkAsInTransit = async (order: any) => {
    await handleUpdateStatus(order, "in_transit")
  }

  // Handle mark as delivered
  const handleMarkAsDelivered = (order: any) => {
    setCurrentOrder(order)
    setShowProofOfDelivery(true)
  }

  // Handle proof of delivery complete
  const handleProofOfDeliveryComplete = async (data: any) => {
    try {
      // Submit proof of delivery
      const response = await fetch("/api/delivery/proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: currentOrder.id,
          photoUrl: data.photo,
          signatureUrl: data.signature,
          receiverName: data.receiverName,
          notes: data.notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit proof of delivery")
      }

      // Refresh orders
      fetchOrders()

      // If COD, prompt for payment collection
      if (currentOrder.payment_method === "cod" && currentOrder.payment_status === "pending") {
        setShowProofOfDelivery(false)
        setShowCODCollection(true)
      } else {
        setShowProofOfDelivery(false)
        setCurrentOrder(null)
      }
    } catch (error) {
      console.error("Error submitting proof of delivery:", error)
      alert("Failed to submit proof of delivery. Please try again.")
    }
  }

  // Handle COD collection complete
  const handleCODComplete = async (amountCollected: number) => {
    try {
      // Submit COD payment
      const response = await fetch("/api/payments/cod/mark-received", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: currentOrder.id,
          amount: amountCollected,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process COD payment")
      }

      // Refresh orders
      fetchOrders()

      setShowCODCollection(false)
      setCurrentOrder(null)
    } catch (error) {
      console.error("Error processing COD payment:", error)
      alert("Failed to process payment. Please try again.")
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!recipientId || !message.trim()) return

    await sendMessage(recipientId, message, currentOrder?.id)
    setMessage("")
    setShowMessageForm(false)
  }

  // Handle message button click
  const handleMessageButtonClick = (order: any, recipientType: "retailer" | "wholesaler") => {
    setCurrentOrder(order)
    setRecipientId(recipientType === "retailer" ? order.retailer_id : order.wholesaler_id)
    setShowMessageForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Delivery Partner Dashboard</h2>
        <p className="text-muted-foreground">Manage your deliveries and track your earnings</p>
      </div>

      {/* Location Status */}
      <Alert className={isTracking ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
        <div className="flex items-center">
          <MapPin className={`h-4 w-4 mr-2 ${isTracking ? "text-green-600" : "text-amber-600"}`} />
          <AlertDescription className={isTracking ? "text-green-600" : "text-amber-600"}>
            {isTracking
              ? `Location tracking active: ${currentLocation?.lat.toFixed(6)}, ${currentLocation?.lng.toFixed(6)}`
              : "Location tracking is not active. Please enable location services."}
          </AlertDescription>
        </div>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground">Orders in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">Waiting for confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Truck className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No active deliveries</h3>
                <p className="text-muted-foreground">You don't have any active deliveries at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        {formatDate(order.created_at)} •{" "}
                        {order.status === "confirmed" ? "Ready for pickup" : "In transit"}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        order.payment_method === "cod" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                      }
                    >
                      {order.payment_method === "cod" ? "Cash on Delivery" : "Paid"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Pickup from:</p>
                          <p>{order.wholesaler?.business_name}</p>
                          <p className="text-sm text-muted-foreground">{order.wholesaler?.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.wholesaler?.city}, {order.wholesaler?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Deliver to:</p>
                          <p>{order.retailer?.business_name}</p>
                          <p className="text-sm text-muted-foreground">{order.retailer?.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.retailer?.city}, {order.retailer?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Order Summary:</p>
                    <ul className="space-y-1">
                      {order.order_items?.map((item: any, index: number) => (
                        <li key={index} className="text-sm">
                          {item.quantity}x {item.product?.name || "Product"}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-medium">Total Amount:</p>
                      <p className="font-bold">₹{order.total_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button className="w-full sm:w-auto" asChild>
                    <Link
                      href={`https://maps.google.com/?q=${
                        order.status === "confirmed"
                          ? `${order.wholesaler?.address}, ${order.wholesaler?.city}`
                          : `${order.retailer?.address}, ${order.retailer?.city}`
                      }`}
                      target="_blank"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Navigate to {order.status === "confirmed" ? "Pickup" : "Delivery"}
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <Link
                      href={`tel:${order.status === "confirmed" ? order.wholesaler?.phone : order.retailer?.phone}`}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call {order.status === "confirmed" ? "Wholesaler" : "Retailer"}
                    </Link>
                  </Button>

                  {order.status === "confirmed" && (
                    <Button variant="default" className="w-full sm:w-auto" onClick={() => handleMarkAsPickedUp(order)}>
                      <Package className="mr-2 h-4 w-4" />
                      Mark as Picked Up
                    </Button>
                  )}

                  {order.status === "dispatched" && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleMarkAsInTransit(order)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Update Location
                      </Button>
                      <Button
                        variant="default"
                        className="w-full sm:w-auto"
                        onClick={() => handleMarkAsDelivered(order)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pending orders</h3>
                <p className="text-muted-foreground">You don't have any pending orders at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>{formatDate(order.created_at)} • Waiting for confirmation</CardDescription>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Retailer:</span> {order.retailer?.business_name}
                    </p>
                    <p>
                      <span className="font-medium">Items:</span> {order.order_items?.length}
                    </p>
                    <p>
                      <span className="font-medium">Total Amount:</span> ₹{order.total_amount?.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No completed deliveries</h3>
                <p className="text-muted-foreground">You haven't completed any deliveries yet.</p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>Delivered on {formatDate(order.updated_at || order.created_at)}</CardDescription>
                    </div>
                    <Badge
                      className={
                        order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }
                    >
                      {order.payment_status === "paid" ? "Paid" : "Payment Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Delivered to:</span> {order.retailer?.business_name}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span> ₹{order.total_amount?.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Payment Method:</span>{" "}
                      {order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  {order.payment_method === "cod" && order.payment_status === "pending" && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        setCurrentOrder(order)
                        setShowCODCollection(true)
                      }}
                    >
                      <IndianRupee className="mr-2 h-4 w-4" />
                      Collect Payment
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Proof of Delivery Dialog */}
      {showProofOfDelivery && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ProofOfDelivery
            orderId={currentOrder.id}
            onComplete={handleProofOfDeliveryComplete}
            onCancel={() => {
              setShowProofOfDelivery(false)
              setCurrentOrder(null)
            }}
          />
        </div>
      )}

      {/* COD Collection Dialog */}
      {showCODCollection && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CODCollection
            order={currentOrder}
            onComplete={handleCODComplete}
            onCancel={() => {
              setShowCODCollection(false)
              setCurrentOrder(null)
            }}
          />
        </div>
      )}

      {/* Message Dialog */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <CardDescription>Send a message regarding order #{currentOrder?.id.substring(0, 8)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Input
                    as="textarea"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowMessageForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
