"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Notification {
  id: string
  title: string
  message: string
  type: "order" | "payment" | "delivery" | "system"
  created_at: string
  is_read: boolean
  action_url?: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)

      // Create client-side supabase instance
      const supabase = createClientComponentClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      // Mock notifications for now - replace with real API call when notifications table is ready
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Order Received",
          message: "Order #2f5d1240 has been placed successfully",
          type: "order",
          created_at: new Date().toISOString(),
          is_read: false,
          action_url: "/orders",
        },
        {
          id: "2",
          title: "Payment Received",
          message: "Payment of ₹8000 received for order #fd224e6b",
          type: "payment",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false,
        },
        {
          id: "3",
          title: "Delivery Completed",
          message: "Order #3ae6d153 has been delivered successfully",
          type: "delivery",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_read: true,
        },
      ]

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      router.push(notification.action_url)
      setOpen(false)
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    const colors = {
      order: "bg-blue-500",
      payment: "bg-green-500",
      delivery: "bg-purple-500",
      system: "bg-gray-500",
    }
    return <div className={`w-2 h-2 rounded-full mr-3 ${colors[type as keyof typeof colors] || colors.system}`} />
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${!notification.is_read ? "bg-blue-50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/notifications")}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
