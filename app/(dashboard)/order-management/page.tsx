"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Order, UserProfile, DeliveryPartner } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  ShoppingCart,
  Store,
  CheckCircle,
  Truck,
  Package,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface OrderWithDetails extends Order {
  retailer: UserProfile
  order_items: {
    id: string
    product_id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
  delivery_partner?: DeliveryPartner
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<OrderWithDetails | null>(null)
  const [estimatedDelivery, setEstimatedDelivery] = useState("")
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([])
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState<string>("")
  const [isAssigningDelivery, setIsAssigningDelivery] = useState(false)
  const [deliveryInstructions, setDeliveryInstructions] = useState("")
  const [showDeliveryTableAlert, setShowDeliveryTableAlert] = useState(false)
  const [statusCounts, setStatusCounts] = useState({
    placed: 0,
    confirmed: 0,
    dispatched: 0,
    delivered: 0,
    rejected: 0,
  })
  const [currentFilter, setCurrentFilter] = useState("placed")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Fetch orders
  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }
        setError(null)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Fetch orders with related data
        const { data, error } = await supabase
          .from("orders")
          .select(`
          *,
          retailer:profiles!retailer_id(id, business_name, phone, address, city, pincode),
          order_items(id, product_id, quantity, price, product:products(name)),
          delivery_partner:delivery_partners(*)
        `)
          .eq("wholesaler_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setOrders(data as OrderWithDetails[])

        // Count orders by status
        const counts = {
          placed: 0,
          confirmed: 0,
          dispatched: 0,
          delivered: 0,
          rejected: 0,
        }

        data.forEach((order: any) => {
          if (counts[order.status as keyof typeof counts] !== undefined) {
            counts[order.status as keyof typeof counts]++
          }
        })

        setStatusCounts(counts)
        setLastUpdated(new Date())
      } catch (error: any) {
        console.error("Error fetching orders:", error)
        setError(error.message)
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [supabase, toast],
  )

  // Initial data fetch
  useEffect(() => {
    fetchOrders()

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchOrders])

  // Fetch delivery partners
  useEffect(() => {
    const fetchDeliveryPartners = async () => {
      try {
        setError(null)

        // Check if delivery_partners table exists
        const { error: tableCheckError } = await supabase.from("delivery_partners").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes('relation "delivery_partners" does not exist')) {
          console.error("Delivery partners table doesn't exist:", tableCheckError)
          setShowDeliveryTableAlert(true)
          return
        }

        // Fetch delivery partners from API
        const response = await fetch("/api/delivery-partners?isActive=true")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch delivery partners: ${response.status}`)
        }

        const data = await response.json()

        if (!data.deliveryPartners || !Array.isArray(data.deliveryPartners)) {
          throw new Error("Invalid delivery partners data received")
        }

        setDeliveryPartners(data.deliveryPartners)
        console.log(`Loaded ${data.deliveryPartners.length} delivery partners`)
      } catch (error: any) {
        console.error("Error fetching delivery partners:", error)
        toast({
          title: "Error",
          description: `Failed to load delivery partners: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    fetchDeliveryPartners()
  }, [supabase, toast])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "d MMM yyyy")
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "h:mm a")
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">New Order</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case "dispatched":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Dispatched</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setIsUpdatingStatus(true)
      setUpdateError(null)
      setUpdateSuccess(null)

      const payload: any = { orderId, status }

      // Add estimated delivery date if dispatching
      if (status === "dispatched" && estimatedDelivery) {
        // Ensure the date is properly formatted
        const deliveryDate = new Date(estimatedDelivery)
        payload.estimatedDelivery = deliveryDate.toISOString()
      }

      // Update order status
      const response = await fetch("/api/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status")
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
                estimated_delivery:
                  status === "dispatched" && estimatedDelivery
                    ? new Date(estimatedDelivery).toISOString()
                    : order.estimated_delivery,
              }
            : order,
        ),
      )

      // Update status counts
      setStatusCounts((prev) => {
        const newCounts = { ...prev }
        // Decrement the previous status count
        const prevStatus = orders.find((o) => o.id === orderId)?.status
        if (prevStatus && prevStatus in newCounts) {
          newCounts[prevStatus as keyof typeof newCounts]--
        }
        // Increment the new status count
        if (status in newCounts) {
          newCounts[status as keyof typeof newCounts]++
        }
        return newCounts
      })

      setUpdateSuccess(`Order status updated to ${status}`)
      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      })

      // Close dialog after a delay
      setTimeout(() => {
        setCurrentOrder(null)
        setEstimatedDelivery("")
        setUpdateSuccess(null)
      }, 2000)

      // Refresh data after update
      fetchOrders(true)
    } catch (error: any) {
      console.error("Error updating order status:", error)
      setUpdateError(error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Assign delivery partner
  const assignDeliveryPartner = async () => {
    // Input validation
    if (!currentOrder) {
      setUpdateError("No order selected")
      return
    }

    if (!selectedDeliveryPartner) {
      setUpdateError("Please select a delivery partner")
      return
    }

    try {
      setIsUpdatingStatus(true)
      setUpdateError(null)
      setUpdateSuccess(null)

      // Assign delivery partner
      const response = await fetch("/api/orders/assign-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: currentOrder.id,
          deliveryPartnerId: selectedDeliveryPartner,
          instructions: deliveryInstructions,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign delivery partner")
      }

      // Find the selected delivery partner
      const partner = deliveryPartners.find((p) => p.id === selectedDeliveryPartner)

      if (!partner) {
        console.warn("Selected delivery partner not found in local state:", selectedDeliveryPartner)
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === currentOrder.id
            ? {
                ...order,
                delivery_partner_id: selectedDeliveryPartner,
                delivery_partner: partner || undefined,
                delivery_instructions: deliveryInstructions,
              }
            : order,
        ),
      )

      setUpdateSuccess("Delivery partner assigned successfully")
      toast({
        title: "Success",
        description: "Delivery partner assigned successfully",
      })

      // Close dialog after a delay
      setTimeout(() => {
        setCurrentOrder(null)
        setSelectedDeliveryPartner("")
        setDeliveryInstructions("")
        setUpdateSuccess(null)
        setIsAssigningDelivery(false)
      }, 2000)

      // Refresh data after update
      await fetchOrders(true)
    } catch (error: any) {
      console.error("Error assigning delivery partner:", error)
      setUpdateError(error.message || "Failed to assign delivery partner")
      toast({
        title: "Error",
        description: error.message || "Failed to assign delivery partner",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Confirm order
  const confirmOrder = (order: OrderWithDetails) => {
    if (confirm("Are you sure you want to confirm this order?")) {
      updateOrderStatus(order.id, "confirmed")
    }
  }

  // Reject order
  const rejectOrder = (order: OrderWithDetails) => {
    if (confirm("Are you sure you want to reject this order?")) {
      updateOrderStatus(order.id, "rejected")
    }
  }

  // Open dispatch dialog
  const openDispatchDialog = (order: OrderWithDetails) => {
    setCurrentOrder(order)
    setUpdateError(null)

    // Set default estimated delivery date (2 days from now)
    const date = new Date()
    date.setDate(date.getDate() + 2)

    // Format date as YYYY-MM-DD for the input field
    const formattedDate = date.toISOString().split("T")[0]
    setEstimatedDelivery(formattedDate)
  }

  // Open assign delivery partner dialog
  const openAssignDeliveryDialog = async (order: OrderWithDetails) => {
    try {
      // Check if delivery_partners table exists
      const { error: tableCheckError } = await supabase.from("delivery_partners").select("id").limit(1)

      if (tableCheckError && tableCheckError.message.includes('relation "delivery_partners" does not exist')) {
        // Table doesn't exist yet
        toast({
          title: "Error",
          description:
            "Delivery partners feature is not yet available. Please run the migration script to create the necessary tables.",
          variant: "destructive",
        })
        return
      }

      setCurrentOrder(order)
      setSelectedDeliveryPartner(order.delivery_partner_id || "")
      setDeliveryInstructions(order.delivery_instructions || "")
      setIsAssigningDelivery(true)
    } catch (error) {
      console.error("Error checking delivery partners table:", error)
      toast({
        title: "Error",
        description: "There was an error accessing delivery partners. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Mark as delivered
  const markAsDelivered = (order: OrderWithDetails) => {
    if (confirm("Are you sure you want to mark this order as delivered?")) {
      updateOrderStatus(order.id, "delivered")
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentFilter(value)
  }

  // Manual refresh
  const handleManualRefresh = () => {
    fetchOrders(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  // Group orders by status
  const placedOrders = orders.filter((order) => order.status === "placed")
  const confirmedOrders = orders.filter((order) => order.status === "confirmed")
  const dispatchedOrders = orders.filter((order) => order.status === "dispatched")
  const deliveredOrders = orders.filter((order) => order.status === "delivered")
  const rejectedOrders = orders.filter((order) => order.status === "rejected")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">Manage and track orders from retailers.</p>
        </div>
        <div className="flex flex-col items-end">
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing} className="mb-2">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
      </div>

      {showDeliveryTableAlert && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-600">
            Delivery partner features are not fully available. Please contact an administrator to run the necessary
            database migrations.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="placed" value={currentFilter} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4 tabs-list overflow-x-auto">
          <TabsTrigger value="placed" className="text-xs md:text-sm tabs-trigger">
            New Orders ({statusCounts.placed})
            {statusCounts.placed > 0 && <span className="ml-1 flex h-2 w-2 rounded-full bg-red-500"></span>}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs md:text-sm tabs-trigger">
            Confirmed ({statusCounts.confirmed})
          </TabsTrigger>
          <TabsTrigger value="dispatched" className="text-xs md:text-sm tabs-trigger">
            Dispatched ({statusCounts.dispatched})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="text-xs md:text-sm tabs-trigger">
            Delivered ({statusCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs md:text-sm tabs-trigger">
            Rejected ({statusCounts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="placed" className="space-y-4 mt-6">
          {renderOrders(placedOrders, "placed")}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4 mt-6">
          {renderOrders(confirmedOrders, "confirmed")}
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-4 mt-6">
          {renderOrders(dispatchedOrders, "dispatched")}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4 mt-6">
          {renderOrders(deliveredOrders, "delivered")}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {renderOrders(rejectedOrders, "rejected")}
        </TabsContent>
      </Tabs>

      {/* Dispatch Order Dialog */}
      <Dialog open={!!currentOrder && !isAssigningDelivery} onOpenChange={(open) => !open && setCurrentOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Order</DialogTitle>
            <DialogDescription>Set an estimated delivery date for this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Estimated Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            {updateError && (
              <Alert variant="destructive">
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
            {updateSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{updateSuccess}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentOrder(null)
                setEstimatedDelivery("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => currentOrder && updateOrderStatus(currentOrder.id, "dispatched")}
              disabled={!estimatedDelivery || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Dispatch Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Partner Dialog */}
      <Dialog open={isAssigningDelivery} onOpenChange={setIsAssigningDelivery}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>Select a delivery partner for this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-partner">Delivery Partner</Label>
              <Select value={selectedDeliveryPartner} onValueChange={setSelectedDeliveryPartner}>
                <SelectTrigger id="delivery-partner">
                  <SelectValue placeholder="Select Delivery Partner" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name} - {partner.vehicle_type} ({partner.vehicle_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-instructions">Delivery Instructions (Optional)</Label>
              <Input
                id="delivery-instructions"
                placeholder="E.g., Fragile items, Call before delivery, etc."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
            </div>

            {updateError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
            {updateSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>{updateSuccess}</AlertDescription>
              </Alert>
            )}
            {deliveryPartners.length === 0 && !showDeliveryTableAlert && !updateError && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  No active delivery partners found. Please add delivery partners first.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssigningDelivery(false)
                setSelectedDeliveryPartner("")
                setDeliveryInstructions("")
                setCurrentOrder(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={assignDeliveryPartner} disabled={!selectedDeliveryPartner || isUpdatingStatus}>
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Partner"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderOrders(ordersList: OrderWithDetails[], status: string) {
    if (ordersList.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
          <p className="mt-2 text-sm text-muted-foreground">You don't have any {status} orders.</p>
        </div>
      )
    }

    return ordersList.map((order) => (
      <Card key={order.id} className="overflow-hidden">
        <CardHeader className="pb-2 px-3 md:px-6">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base md:text-lg">
                Order #{order.id.substring(0, 8)}
                <span className="ml-2">{getStatusBadge(order.status)}</span>
              </CardTitle>
              <div className="flex flex-col md:flex-row items-end md:items-center gap-1">
                <Badge variant="outline" className="font-normal text-xs">
                  {order.payment_method === "cod" ? "Cash on Delivery" : "UPI Payment"}
                </Badge>
                {getPaymentStatusBadge(order.payment_status)}
              </div>
            </div>
            <CardDescription className="text-xs">
              Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Retailer</h4>
              <div className="flex items-start gap-2">
                <Store className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.retailer.business_name}</p>
                  <p className="text-sm text-muted-foreground">{order.retailer.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.retailer.city}, {order.retailer.pincode}
                  </p>
                  <p className="text-sm text-muted-foreground">Phone: {order.retailer.phone}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Order Details</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Items:</span>
                  <span className="font-medium">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">₹{order.total_amount.toFixed(2)}</span>
                </div>
                {order.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Delivery:</span>
                    <span className="font-medium">{formatDate(order.estimated_delivery)}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Notes:</span>
                    <p className="text-sm mt-1">{order.notes}</p>
                  </div>
                )}
                {order.delivery_partner && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Delivery Partner:</span>
                    <p className="text-sm font-medium mt-1">
                      {order.delivery_partner.name} ({order.delivery_partner.phone})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_partner.vehicle_type} - {order.delivery_partner.vehicle_number}
                    </p>
                  </div>
                )}
                {order.delivery_instructions && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Delivery Instructions:</span>
                    <p className="text-sm mt-1">{order.delivery_instructions}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="space-y-2">
                {status === "placed" && (
                  <>
                    <Button className="w-full" onClick={() => confirmOrder(order)}>
                      <Check className="mr-2 h-4 w-4" />
                      Confirm Order
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => rejectOrder(order)}>
                      <X className="mr-2 h-4 w-4" />
                      Reject Order
                    </Button>
                  </>
                )}

                {status === "confirmed" && (
                  <>
                    <Button className="w-full" onClick={() => openDispatchDialog(order)}>
                      <Truck className="mr-2 h-4 w-4" />
                      Dispatch Order
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => openAssignDeliveryDialog(order)}>
                      <Truck className="mr-2 h-4 w-4" />
                      Assign Delivery Partner
                    </Button>
                  </>
                )}

                {status === "dispatched" && (
                  <>
                    <Button className="w-full" onClick={() => markAsDelivered(order)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Delivered
                    </Button>
                    {!order.delivery_partner && (
                      <Button variant="outline" className="w-full" onClick={() => openAssignDeliveryDialog(order)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Assign Delivery Partner
                      </Button>
                    )}
                  </>
                )}

                {(status === "delivered" || status === "rejected") && (
                  <p className="text-sm text-muted-foreground text-center">No actions available for this order.</p>
                )}

                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href={`/orders/${order.id}`}>View Order Details</Link>
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h4 className="text-sm font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{item.product?.name || "Product"}</span>
                    <span className="text-sm text-muted-foreground">× {item.quantity}</span>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }
}
