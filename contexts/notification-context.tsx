"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: any
  related_entity_type?: string | null
  related_entity_id?: string | null
  action_url?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch notifications directly from Supabase
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError)
        setError("Failed to load notifications")
        return
      }

      // Validate and filter out notifications with invalid UUIDs
      const validNotifications = data?.filter((notification) => {
        // Check if related_entity_id is a valid UUID if it exists
        if (notification.related_entity_id) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          return uuidRegex.test(notification.related_entity_id)
        }
        return true
      })

      setNotifications(validNotifications || [])
      setUnreadCount(validNotifications?.filter((n) => !n.is_read).length || 0)
    } catch (error: any) {
      console.error("Error in fetchNotifications:", error)
      setError("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return

      try {
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

        if (error) throw error

        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification,
          ),
        )

        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error: any) {
        console.error("Error marking notification as read:", error)
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        })
      }
    },
    [userId, toast],
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) throw error

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, is_read: true })),
      )

      setUnreadCount(0)

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }, [userId, toast])

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

      if (error) throw error

      // Update local state
      const deletedNotification = notifications.find((n) => n.id === notificationId)
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId),
      )

      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error: any) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!userId) return

    try {
      const channel = supabase
        .channel(`user-notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            // Validate the notification before adding it
            const newNotification = payload.new as Notification

            // Check if related_entity_id is a valid UUID if it exists
            if (newNotification.related_entity_id) {
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
              if (!uuidRegex.test(newNotification.related_entity_id)) {
                console.warn("Received notification with invalid UUID, skipping")
                return
              }
            }

            // Add new notification to state
            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            })
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.error("Error setting up notification subscription:", err)
    }
  }, [userId, supabase, toast])

  // Load notifications on mount and when userId changes
  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }

    getInitialSession()
  }, [supabase])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [fetchNotifications, userId])

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }

  return context
}
