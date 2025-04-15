"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notification-context"
import { formatDistanceToNow } from "date-fns"

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  // Format date
  const formatNotificationTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)

    // Handle different notification types
    if (notification.type === "message" && notification.data?.conversationId) {
      // Navigate to conversation
      window.location.href = `/messages?conversation=${notification.data.conversationId}`
    } else if (notification.type === "order" && notification.data?.orderId) {
      // Navigate to order
      window.location.href = `/orders/${notification.data.orderId}`
    }

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          {notifications.length === 0 ? (
            <div className="flex justify-center p-4">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col p-4 cursor-pointer hover:bg-muted/50 ${!notification.is_read ? "bg-muted/50" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{formatNotificationTime(notification.created_at)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
                <Separator className="mt-4" />
              </div>
            ))
          )}
        </div>
        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
