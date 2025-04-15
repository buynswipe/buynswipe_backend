"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  created_at: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  link?: string
  data?: {
    address?: string
    phone?: string
  }
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // For demo purposes, we'll create mock notifications
        // In a real app, you would fetch from a notifications table
        const mockNotifications: Notification[] = [
          {
            id: "1",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            user_id: session.user.id,
            title: "New Order Placed",
            message: "Your order #12345 has been placed successfully.",
            is_read: false,
            link: "/orders/12345",
            data: {
              address: "123 Main St",
              phone: "555-1234",
            },
          },
          {
            id: "2",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            user_id: session.user.id,
            title: "Payment Received",
            message: "Payment for order #12345 has been received.",
            is_read: true,
            link: "/payments",
            data: {
              address: "456 Elm St",
              phone: "555-5678",
            },
          },
          {
            id: "3",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            user_id: session.user.id,
            title: "Order Dispatched",
            message: "Your order #12345 has been dispatched.",
            is_read: true,
            link: "/orders/12345",
            data: {
              address: "789 Oak St",
              phone: "555-9012",
            },
          },
        ]

        setNotifications(mockNotifications)
        setUnreadCount(mockNotifications.filter((n) => !n.is_read).length)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [supabase])

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="text-sm font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="outline" className="ml-auto">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex justify-center p-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col p-4 ${!notification.is_read ? "bg-muted/50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    {notification.data?.address && (
                      <p className="text-xs text-muted-foreground">Address: {notification.data.address}</p>
                    )}
                    {notification.data?.phone && (
                      <p className="text-xs text-muted-foreground">Phone: {notification.data.phone}</p>
                    )}
                  </div>
                  {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                  {notification.link && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      View
                    </Button>
                  )}
                </div>
                <Separator className="mt-4" />
              </div>
            ))
          )}
        </div>
        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
