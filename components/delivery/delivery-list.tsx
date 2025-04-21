"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Package, MapPin, Phone, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  payment_method: string
  payment_status: string
  estimated_delivery?: string
  delivery_instructions?: string
  retailer: {
    business_name: string
    address: string
    city: string
    pincode: string
    phone: string
  }
  wholesaler: {
    business_name: string
    address: string
    city: string
    pincode: string
    phone: string
  }
}

interface DeliveryListProps {
  orders: Order[]
  deliveryPartnerId: string
}

export function DeliveryList({ orders, deliveryPartnerId }: DeliveryListProps) {
  const [filter, setFilter] = useState<string>("all")

  // Filter orders based on status
  const filteredOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter)

  // If no orders, show empty state
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-16 h-16 mb-4 text-gray-400">
          <Package className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No active deliveries</h3>
        <p className="text-gray-500 text-center mt-2">
          You don&apos;t have any active deliveries assigned to you at the moment.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="whitespace-nowrap"
        >
          All ({orders.length})
        </Button>
        <Button
          variant={filter === "dispatched" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("dispatched")}
          className="whitespace-nowrap"
        >
          New ({orders.filter((o) => o.status === "dispatched").length})
        </Button>
        <Button
          variant={filter === "in_transit" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("in_transit")}
          className="whitespace-nowrap"
        >
          In Transit ({orders.filter((o) => o.status === "in_transit").length})
        </Button>
        <Button
          variant={filter === "out_for_delivery" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("out_for_delivery")}
          className="whitespace-nowrap"
        >
          Out for Delivery ({orders.filter((o) => o.status === "out_for_delivery").length})
        </Button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No deliveries match the selected filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === "dispatched"
                          ? "outline"
                          : order.status === "in_transit"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{order.retailer.business_name}</p>
                        <p className="text-sm text-gray-500">
                          {order.retailer.address}, {order.retailer.city}, {order.retailer.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm">{order.retailer.phone}</p>
                    </div>

                    {order.delivery_instructions && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm">{order.delivery_instructions}</p>
                      </div>
                    )}

                    {order.estimated_delivery && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-sm">
                          Expected by: {new Date(order.estimated_delivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <p className="text-sm">From: {order.wholesaler.business_name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      <p className="text-sm">
                        Payment: {order.payment_method.toUpperCase()} ({order.payment_status})
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 p-4">
                <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
                <Link href={`/delivery-partner/tracking/${order.id}`}>
                  <Button>Manage Delivery</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
