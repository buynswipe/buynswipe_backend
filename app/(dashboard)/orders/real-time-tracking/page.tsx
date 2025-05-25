"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Truck,
  Package,
  Clock,
  CheckCircle,
  Search,
  Phone,
  MessageSquare,
  Navigation,
  AlertCircle,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface OrderTracking {
  id: string
  order_number: string
  status: "placed" | "confirmed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered"
  customer: {
    name: string
    phone: string
    address: string
    coordinates: { lat: number; lng: number }
  }
  delivery_partner: {
    name: string
    phone: string
    vehicle: string
    current_location: { lat: number; lng: number }
  }
  timeline: Array<{
    status: string
    timestamp: string
    location?: string
    notes?: string
  }>
  estimated_delivery: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total_amount: number
  payment_status: "pending" | "paid"
  special_instructions?: string
}

export default function RealTimeOrderTracking() {
  const [orders, setOrders] = useState<OrderTracking[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderTracking | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadOrdersData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      updateOrderLocations()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadOrdersData = async () => {
    try {
      setLoading(true)

      // Mock data for demonstration
      const mockOrders: OrderTracking[] = [
        {
          id: "1",
          order_number: "ORD-2024-001",
          status: "out_for_delivery",
          customer: {
            name: "Rajesh Kumar",
            phone: "+91 98765 43210",
            address: "123 MG Road, Bangalore, Karnataka 560001",
            coordinates: { lat: 12.9716, lng: 77.5946 },
          },
          delivery_partner: {
            name: "Suresh Delivery",
            phone: "+91 87654 32109",
            vehicle: "Bike - KA 01 AB 1234",
            current_location: { lat: 12.965, lng: 77.585 },
          },
          timeline: [
            { status: "placed", timestamp: "2024-01-20T09:00:00Z", location: "Online" },
            { status: "confirmed", timestamp: "2024-01-20T09:15:00Z", location: "Warehouse" },
            { status: "dispatched", timestamp: "2024-01-20T10:30:00Z", location: "Distribution Center" },
            {
              status: "out_for_delivery",
              timestamp: "2024-01-20T14:00:00Z",
              location: "Local Hub",
              notes: "Out for delivery with Suresh",
            },
          ],
          estimated_delivery: "2024-01-20T16:00:00Z",
          items: [
            { name: "Premium Rice 5kg", quantity: 2, price: 500 },
            { name: "Cooking Oil 1L", quantity: 1, price: 150 },
          ],
          total_amount: 1150,
          payment_status: "paid",
          special_instructions: "Call before delivery",
        },
        {
          id: "2",
          order_number: "ORD-2024-002",
          status: "in_transit",
          customer: {
            name: "Priya Sharma",
            phone: "+91 98765 43211",
            address: "456 Brigade Road, Bangalore, Karnataka 560025",
            coordinates: { lat: 12.9698, lng: 77.6205 },
          },
          delivery_partner: {
            name: "Ramesh Transport",
            phone: "+91 87654 32108",
            vehicle: "Van - KA 02 CD 5678",
            current_location: { lat: 12.95, lng: 77.6 },
          },
          timeline: [
            { status: "placed", timestamp: "2024-01-20T08:30:00Z", location: "Online" },
            { status: "confirmed", timestamp: "2024-01-20T08:45:00Z", location: "Warehouse" },
            { status: "dispatched", timestamp: "2024-01-20T11:00:00Z", location: "Distribution Center" },
            {
              status: "in_transit",
              timestamp: "2024-01-20T13:30:00Z",
              location: "Highway",
              notes: "En route to delivery area",
            },
          ],
          estimated_delivery: "2024-01-20T17:30:00Z",
          items: [
            { name: "Wheat Flour 10kg", quantity: 1, price: 450 },
            { name: "Sugar 1kg", quantity: 3, price: 45 },
          ],
          total_amount: 585,
          payment_status: "pending",
        },
      ]

      setOrders(mockOrders)
      if (mockOrders.length > 0) {
        setSelectedOrder(mockOrders[0])
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderLocations = () => {
    // Simulate location updates
    setOrders((prevOrders) =>
      prevOrders.map((order) => ({
        ...order,
        delivery_partner: {
          ...order.delivery_partner,
          current_location: {
            lat: order.delivery_partner.current_location.lat + (Math.random() - 0.5) * 0.001,
            lng: order.delivery_partner.current_location.lng + (Math.random() - 0.5) * 0.001,
          },
        },
      })),
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      placed: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      dispatched: "bg-purple-100 text-purple-800",
      in_transit: "bg-yellow-100 text-yellow-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return <Package className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "dispatched":
        return <Truck className="h-4 w-4" />
      case "in_transit":
        return <Navigation className="h-4 w-4" />
      case "out_for_delivery":
        return <MapPin className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Real-Time Order Tracking</h1>
        <p className="text-gray-600">Monitor all orders with live location updates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Orders List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{order.order_number}</span>
                      <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer.name}</p>
                    <p className="text-sm text-gray-500">₹{order.total_amount}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      ETA: {new Date(order.estimated_delivery).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Order Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedOrder.order_number}</CardTitle>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Customer Details</h4>
                      <p className="text-sm">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Delivery Partner</h4>
                      <p className="text-sm">{selectedOrder.delivery_partner.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.delivery_partner.vehicle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Call Driver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="h-3 w-3 mr-1" />
                          Track Live
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.special_instructions && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Special Instructions:</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">{selectedOrder.special_instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          {getStatusIcon(event.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium capitalize">{event.status.replace("_", " ")}</h4>
                            <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          {event.location && <p className="text-sm text-gray-600">Location: {event.location}</p>}
                          {event.notes && <p className="text-sm text-gray-600">{event.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total Amount</span>
                        <span>₹{selectedOrder.total_amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span>Payment Status</span>
                        <Badge variant={selectedOrder.payment_status === "paid" ? "default" : "secondary"}>
                          {selectedOrder.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Order</h3>
                <p className="text-gray-600">Choose an order from the list to view detailed tracking information</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
