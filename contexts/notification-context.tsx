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
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      // Fix: Handle potential UUID format issues by using proper error handling
      try {
        const { data, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(50)

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError)
          setError("Failed to load notifications. Please try again.")
          return
        }

        setNotifications(data || [])
        setUnreadCount(data?.filter((n: Notification) => !n.is_read).length || 0)
      } catch (err: any) {
        console.error("Error processing notifications:", err)
        setError("Failed to process notifications data")
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
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
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false)

      if (error) throw error

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, is_read: true })),
      )

      setUnreadCount(0)
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error)
    }
  }

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
    }
  }

  // Set up real-time subscription for new notifications
  useEffect(() => {
    const setupSubscription = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      try {
        const subscription = supabase
          .channel(`user-notifications-${session.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              // Add new notification to state
              const newNotification = payload.new as Notification
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
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Error setting up notification subscription:", err)
      }
    }

    setupSubscription()
  }, [supabase, toast])

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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
