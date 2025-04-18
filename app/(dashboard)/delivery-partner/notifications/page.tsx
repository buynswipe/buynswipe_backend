"use client"

import { useState, useEffect } from "react"
import { Package, ShoppingCart, AlertCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  order_id?: string
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications?type=all")

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const { data } = await response.json()

      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      case "delivery":
        return <Package className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="order">Order</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.read ? "" : "border-l-4 border-l-blue-500"}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                    <CardDescription>{notification.message}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {notification.order_id && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${notification.order_id}`}>View Order</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">You don't have any notifications at the moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivery">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.filter((n) => n.type === "delivery").length > 0 ? (
            <div className="space-y-4">
              {notifications
                .filter((n) => n.type === "delivery")
                .map((notification) => (
                  <Card key={notification.id} className={notification.read ? "" : "border-l-4 border-l-blue-500"}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-lg">{notification.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
                      <CardDescription>{notification.message}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {notification.order_id && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/orders/${notification.order_id}`}>View Order</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No delivery notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have any delivery notifications at the moment.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="order">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.filter((n) => n.type === "order").length > 0 ? (
            <div className="space-y-4">
              {notifications
                .filter((n) => n.type === "order")
                .map((notification) => (
                  <Card key={notification.id} className={notification.read ? "" : "border-l-4 border-l-blue-500"}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-lg">{notification.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
                      <CardDescription>{notification.message}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {notification.order_id && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/orders/${notification.order_id}`}>View Order</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No order notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You don't have any order notifications at the moment.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
