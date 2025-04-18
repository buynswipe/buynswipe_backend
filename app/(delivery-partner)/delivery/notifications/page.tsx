"use client"

import { Button } from "@/components/ui/button"

import { CardFooter } from "@/components/ui/card"

import { CardDescription } from "@/components/ui/card"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bell, MapPin, Phone } from "lucide-react"

export default function DeliveryPartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const supabase = createClientComponentClient()

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

        // Get delivery partner info
        const { data: partner } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        // Fetch notifications for the delivery partner
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setNotifications(data || [])
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [supabase])

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
    return notification.type === activeTab
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">View and manage your notifications.</p>
      </div>

      <Tabs defaultValue="all">
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
      return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
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

    return notificationsList.map((notification) => (
      <Card key={notification.id}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{notification.title}</CardTitle>
              <CardDescription>{notification.message}</CardDescription>
            </div>
            {getStatusBadge(notification.type)}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm">{notification.data?.address || "No address provided"}</p>
                <p className="text-sm">
                  {notification.data?.city}, {notification.data?.pincode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{notification.data?.phone || "No phone number provided"}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </CardFooter>
      </Card>
    ))
  }
}
