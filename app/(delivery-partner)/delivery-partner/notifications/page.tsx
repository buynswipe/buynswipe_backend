"use client"

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bell, MapPin, Phone, AlertCircle, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function DeliveryPartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [loadingNotificationId, setLoadingNotificationId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  // Function to mark notifications as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

        // Update local state
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    },
    [supabase],
  )

  // Copy order ID to clipboard
  const copyOrderId = useCallback(
    (orderId: string) => {
      navigator.clipboard.writeText(orderId)
      toast({
        title: "Copied to clipboard",
        description: `Order ID ${orderId} copied to clipboard`,
      })
    },
    [toast],
  )

  // Extract order ID from notification
  const extractOrderId = useCallback((notification: any) => {
    // First try related_entity_id
    if (notification.related_entity_id) {
      return notification.related_entity_id
    }

    // Try to extract from message text
    if (notification.message) {
      // Look for patterns like #abc123 or order ID: xyz789
      const orderMatch =
        notification.message.match(/#([a-zA-Z0-9-]+)/) ||
        notification.message.match(/order\s+(?:id|number)?:?\s*([a-zA-Z0-9-]+)/i)

      if (orderMatch && orderMatch[1]) {
        return orderMatch[1]
      }
    }

    // Try to extract from data
    if (notification.data) {
      const data = typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data

      if (data.order_id) return data.order_id
      if (data.orderId) return data.orderId
      if (data.id) return data.id
    }

    return null
  }, [])

  // Handle view details click
  const handleViewDetails = useCallback(
    async (notification: any) => {
      try {
        setLoadingNotificationId(notification.id)

        // Mark as read
        await markAsRead(notification.id)

        // Extract order ID using the helper function
        const orderId = extractOrderId(notification)

        // Log the extracted order ID
        console.log(`Extracted order ID: ${orderId} from notification:`, notification)

        // Navigate to the appropriate page
        if (notification.action_url) {
          // Use the action_url if available
          console.log(`Navigating to action URL: ${notification.action_url}`)
          router.push(notification.action_url)
        } else if (orderId) {
          // Navigate to the tracking page for this order
          console.log(`Navigating to order tracking: ${orderId}`)
          router.push(`/delivery-partner/tracking/${orderId}`)
        } else {
          // If we can't determine the order ID, show an error
          console.error("Could not determine order ID from notification:", notification)
          toast({
            title: "Error",
            description: "Could not determine order ID. Please try again or contact support.",
            variant: "destructive",
          })
          setLoadingNotificationId(null)
        }
      } catch (error) {
        console.error("Error handling view details:", error)
        toast({
          title: "Error",
          description: "Could not load order details. Please try again.",
          variant: "destructive",
        })
        setLoadingNotificationId(null)
      }
    },
    [markAsRead, router, toast, extractOrderId],
  )

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          throw new Error("Not authenticated")
        }

        // Fetch notifications for the delivery partner
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Process notifications data
        const processedNotifications = (data || []).map((notification) => {
          // Parse data field if it's a string
          if (notification.data && typeof notification.data === "string") {
            try {
              notification.data = JSON.parse(notification.data)
            } catch (e) {
              console.error("Error parsing notification data:", e)
              notification.data = {} // Set to empty object if parsing fails
            }
          }
          return notification
        })

        // CRITICAL FIX: Deduplicate notifications based on related_entity_id and created_at
        const deduplicatedNotifications = []
        const seenEntities = new Set()

        // Sort by created_at in descending order to keep the newest
        const sortedData = [...processedNotifications].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )

        for (const notification of sortedData) {
          // Create a unique key for each entity
          const entityKey = `${notification.related_entity_type}:${notification.related_entity_id}`

          // If we haven't seen this entity before, add it to our results
          if (!seenEntities.has(entityKey)) {
            seenEntities.add(entityKey)
            deduplicatedNotifications.push(notification)
          }
        }

        setNotifications(deduplicatedNotifications)
      } catch (error: any) {
        console.error("Error fetching notifications:", error)
        setError(error.message)
        toast({
          title: "Error",
          description: "Failed to load notifications. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [supabase, toast])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get status badge
  const getStatusBadge = (type: string) => {
    switch (type) {
      case "order":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Order</Badge>
      case "delivery":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivery</Badge>
      case "payment":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Payment</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    return notification.related_entity_type === activeTab || notification.type === activeTab
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">View and manage your notifications.</p>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="order">Order</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {renderNotifications(filteredNotifications)}
        </TabsContent>

        <TabsContent value="order" className="space-y-4 mt-6">
          {renderNotifications(filteredNotifications)}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4 mt-6">
          {renderNotifications(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderNotifications(notificationsList: any[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-500 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>Error: {error}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )
    }

    if (notificationsList.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Notifications</h3>
          <p className="mt-2 text-sm text-muted-foreground">You don't have any notifications yet.</p>
        </div>
      )
    }

    return notificationsList.map((notification) => {
      const orderId = extractOrderId(notification)

      return (
        <Card key={notification.id} className={notification.is_read ? "opacity-75" : ""}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{notification.title}</CardTitle>
                <CardDescription>{notification.message}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" title="Unread notification"></div>
                )}
                {getStatusBadge(notification.related_entity_type || notification.type)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2">
              {/* Display order ID if available */}
              {orderId && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="text-sm">
                    <span className="font-medium">Order ID:</span> {orderId}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyOrderId(orderId)
                    }}
                    title="Copy Order ID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Display address information with fallbacks */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  {notification.data?.business_name && (
                    <p className="text-sm font-medium">{notification.data.business_name}</p>
                  )}
                  <p className="text-sm">{notification.data?.address || "No address provided"}</p>
                  {(notification.data?.city || notification.data?.pincode) && (
                    <p className="text-sm">
                      {notification.data?.city || ""}
                      {notification.data?.city && notification.data?.pincode ? ", " : ""}
                      {notification.data?.pincode || ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Display phone information with fallback */}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{notification.data?.phone || "No phone number provided"}</p>
              </div>

              {/* Display delivery instructions if available */}
              {notification.data?.delivery_instructions && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">Instructions:</p>
                  <p className="text-sm">{notification.data.delivery_instructions}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleViewDetails(notification)}
              disabled={loadingNotificationId === notification.id}
            >
              {loadingNotificationId === notification.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "View Details"
              )}
            </Button>
            {orderId && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  // Open in new tab
                  window.open(`/delivery-partner/tracking/${orderId}`, "_blank")
                }}
              >
                Open in New Tab
              </Button>
            )}
          </CardFooter>
        </Card>
      )
    })
  }
}
