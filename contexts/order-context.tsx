"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import type { Order } from "@/types/database.types"

interface OrderContextType {
  // Orders
  orders: Order[]
  activeOrder: Order | null
  isLoading: boolean
  error: string | null

  // Order operations
  fetchOrders: () => Promise<void>
  fetchOrderById: (id: string) => Promise<Order | null>
  placeOrder: (orderData: any) => Promise<{ success: boolean; orderId?: string; error?: string }>
  updateOrderStatus: (orderId: string, status: string, data?: any) => Promise<boolean>
  assignDeliveryPartner: (orderId: string, partnerId: string, instructions?: string) => Promise<boolean>

  // Delivery tracking
  trackDelivery: (orderId: string) => Promise<any>
  submitDeliveryProof: (orderId: string, proofData: any) => Promise<boolean>
  markPaymentReceived: (orderId: string, amount: number) => Promise<boolean>

  // Communication
  sendMessage: (recipientId: string, message: string, orderId?: string) => Promise<boolean>

  // User role
  userRole: string | null
  userId: string | null
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        setUserId(session.user.id)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) throw profileError

        setUserRole(profile.role)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [supabase])

  // Fetch orders based on user role
  const fetchOrders = useCallback(async () => {
    if (!userRole || !userId) return

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase.from("orders").select(`
        *,
        retailer:profiles!retailer_id(*),
        wholesaler:profiles!wholesaler_id(*),
        order_items(*),
        delivery_partner:delivery_partners(*)
      `)

      // Filter orders based on user role
      if (userRole === "retailer") {
        query = query.eq("retailer_id", userId)
      } else if (userRole === "wholesaler") {
        query = query.eq("wholesaler_id", userId)
      } else if (userRole === "delivery_partner") {
        // First get the delivery partner id
        const { data: partner } = await supabase.from("delivery_partners").select("id").eq("user_id", userId).single()

        if (partner) {
          console.log("Delivery partner ID found:", partner.id)
          query = query.eq("delivery_partner_id", partner.id)
        } else {
          console.error("No delivery partner record found for user ID:", userId)
        }
      }

      const { data, error: ordersError } = await query.order("created_at", { ascending: false })

      if (ordersError) throw ordersError

      setOrders(data || [])
    } catch (error: any) {
      setError(error.message)
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, userRole, userId])

  // Fetch orders when user role changes
  useEffect(() => {
    if (userRole) {
      fetchOrders()
    }
  }, [userRole, fetchOrders])

  // Fetch order by ID
  const fetchOrderById = async (id: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          retailer:profiles!retailer_id(*),
          wholesaler:profiles!wholesaler_id(*),
          order_items(*, product:products(*)),
          delivery_partner:delivery_partners(*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      setActiveOrder(data)
      return data
    } catch (error: any) {
      console.error("Error fetching order:", error)
      setError(error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Place a new order
  const placeOrder = async (orderData: any) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order")
      }

      // Refresh orders
      fetchOrders()

      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully.",
      })

      return { success: true, orderId: data.order.id }
    } catch (error: any) {
      console.error("Error placing order:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      })

      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string, data: any = {}) => {
    try {
      setIsLoading(true)

      const payload = {
        orderId,
        status,
        ...data,
      }

      const response = await fetch("/api/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to update order status to ${status}`)
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status, ...data } : order)),
      )

      if (activeOrder?.id === orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, status, ...data } : null))
      }

      toast({
        title: "Order Updated",
        description: `Order status updated to ${status}.`,
      })

      return true
    } catch (error: any) {
      console.error("Error updating order status:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Assign delivery partner
  const assignDeliveryPartner = async (orderId: string, partnerId: string, instructions?: string) => {
    try {
      if (!orderId || !partnerId) {
        toast({
          title: "Error",
          description: "Order ID and delivery partner ID are required",
          variant: "destructive",
        })
        return false
      }

      setIsLoading(true)

      const response = await fetch("/api/orders/assign-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          deliveryPartnerId: partnerId,
          instructions,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign delivery partner")
      }

      // Update local state
      await fetchOrders()

      // If we have an active order, refresh it
      if (activeOrder?.id === orderId) {
        await fetchOrderById(orderId)
      }

      toast({
        title: "Success",
        description: "Delivery partner has been assigned successfully.",
      })

      return true
    } catch (error: any) {
      console.error("Error assigning delivery partner:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to assign delivery partner",
        variant: "destructive",
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Track delivery
  const trackDelivery = async (orderId: string) => {
    try {
      const response = await fetch(`/api/delivery/tracking?orderId=${orderId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch delivery updates")
      }

      return data
    } catch (error: any) {
      console.error("Error tracking delivery:", error)
      return { updates: [], proof: null, error: error.message }
    }
  }

  // Submit proof of delivery
  const submitDeliveryProof = async (orderId: string, proofData: any) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/delivery/proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          ...proofData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit proof of delivery")
      }

      // Update local state
      fetchOrders()

      toast({
        title: "Delivery Completed",
        description: "Proof of delivery submitted successfully.",
      })

      return true
    } catch (error: any) {
      console.error("Error submitting proof of delivery:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to submit proof of delivery",
        variant: "destructive",
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Mark payment received (for COD)
  const markPaymentReceived = async (orderId: string, amount: number) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/payments/cod/mark-received", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark payment as received")
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, payment_status: "paid" } : order)),
      )

      if (activeOrder?.id === orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, payment_status: "paid" } : null))
      }

      toast({
        title: "Payment Received",
        description: "Payment has been marked as received.",
      })

      return true
    } catch (error: any) {
      console.error("Error marking payment as received:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to mark payment as received",
        variant: "destructive",
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Send message
  const sendMessage = async (recipientId: string, message: string, orderId?: string) => {
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId,
          message,
          orderId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      return true
    } catch (error: any) {
      console.error("Error sending message:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })

      return false
    }
  }

  const value = {
    orders,
    activeOrder,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    placeOrder,
    updateOrderStatus,
    assignDeliveryPartner,
    trackDelivery,
    submitDeliveryProof,
    markPaymentReceived,
    sendMessage,
    userRole,
    userId,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const context = useContext(OrderContext)

  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider")
  }

  return context
}
