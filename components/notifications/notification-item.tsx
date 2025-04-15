"use client"

import {
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Package,
  Truck,
  User,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/contexts/notification-provider"
import type { Notification } from "@/lib/notifications"
import { useRouter } from "next/navigation"

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotifications()
  const router = useRouter()

  const handleClick = async () => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.related_entity_type === "order" && notification.related_entity_id) {
      router.push(`/orders/${notification.related_entity_id}`)
    } else if (notification.related_entity_type === "payment" && notification.related_entity_id) {
      router.push(`/payments?id=${notification.related_entity_id}`)
    } else if (notification.related_entity_type === "delivery" && notification.related_entity_id) {
      router.push(`/delivery/tracking/${notification.related_entity_id}`)
    }

    if (onClose) {
      onClose()
    }
  }

  // Get icon based on entity type
  const getEntityIcon = () => {
    switch (notification.related_entity_type) {
      case "order":
        return <ShoppingBag className="h-4 w-4 mr-2" />
      case "payment":
        return <CreditCard className="h-4 w-4 mr-2" />
      case "product":
        return <Package className="h-4 w-4 mr-2" />
      case "delivery":
        return <Truck className="h-4 w-4 mr-2" />
      case "user":
        return <User className="h-4 w-4 mr-2" />
      default:
        return getTypeIcon()
    }
  }

  // Get icon based on notification type
  const getTypeIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
      case "info":
        return <Info className="h-4 w-4 mr-2 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
      default:
        return <Info className="h-4 w-4 mr-2" />
    }
  }

  return (
    <DropdownMenuItem
      className={`flex flex-col items-start py-3 px-4 ${!notification.is_read ? "bg-accent/50" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-start w-full">
        <div className="flex-shrink-0 mt-0.5">{getEntityIcon()}</div>
        <div className="ml-2 flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          {notification.data?.address && (
            <p className="text-xs text-muted-foreground mt-1">Address: {notification.data.address}</p>
          )}
          {notification.data?.phone && (
            <p className="text-xs text-muted-foreground mt-1">Phone: {notification.data.phone}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </DropdownMenuItem>
  )
}
