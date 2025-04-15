"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import {
  type Notification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "@/lib/notifications"
import { useAuth } from "./auth-context"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refreshNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch notifications
      const { data, error: notificationsError } = await getUserNotifications({
        limit: 50,
        orderBy: "newest",
      })

      if (notificationsError) throw notificationsError

      // Count unread
      const { count, error: countError } = await getUnreadNotificationCount()
      if (countError) throw countError

      setNotifications(data || [])
      setUnreadCount(count)
    } catch (err: any) {
      console.error("Error fetching notifications:", err)
      setError(err.message || "Failed to load notifications")
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return

      try {
        const { success, error } = await markNotificationAsRead(id)

        if (error) throw error

        if (success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
          )

          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch (err: any) {
        console.error("Error marking notification as read:", err)
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  const markAllAsRead = useCallback(async () => {
    if (!user) return

    try {
      const { success, error } = await markAllNotificationsAsRead()

      if (error) throw error

      if (success) {
        // Update local state
        setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))

        // Update unread count
        setUnreadCount(0)

        toast({
          title: "Success",
          description: "All notifications marked as read",
        })
      }
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }, [user, toast])

  // Subscribe to notifications in real-time
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification

          // Update notifications list
          setNotifications((prev) => [newNotification, ...prev])

          // Update unread count
          setUnreadCount((prev) => prev + 1)

          // Show toast for the new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === "error" ? "destructive" : "default",
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, toast])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
