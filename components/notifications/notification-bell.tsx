"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getUnreadNotificationCount } from "@/lib/notification-api"
import { useRouter } from "next/navigation"

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count } = await getUnreadNotificationCount(userId)
        setUnreadCount(count)
      } catch (error) {
        console.error("Error fetching unread notifications:", error)
      }
    }

    fetchUnreadCount()

    // Set up polling to check for new notifications
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [userId])

  const handleViewAll = () => {
    router.push("/notifications")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Notifications</h4>
            <Button variant="ghost" size="sm" onClick={handleViewAll}>
              View all
            </Button>
          </div>
          <div className="h-px bg-border" />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {unreadCount === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No new notifications</div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                You have {unreadCount} unread notification{unreadCount !== 1 && "s"}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
