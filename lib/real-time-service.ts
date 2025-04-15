"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

// Types for notifications
export interface Notification {
  id: string
  created_at: string
  user_id: string
  title: string
  message: string
  type: "order" | "inventory" | "payment" | "delivery" | "system"
  is_read: boolean
  action_url?: string
  reference_id?: string
}

// Hook for subscribing to real-time updates
export function useRealTimeUpdates() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data as Notification[])
      setUnreadCount(data.filter((n: any) => !n.is_read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
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
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications()

    // Set up Supabase real-time subscription
    const setupRealtimeSubscription = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      // Subscribe to notifications table
      const channel = supabase
        .channel("notifications-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification

            // Update notifications list
            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            // Show toast notification without action button
            toast({
              title: newNotification.title,
              description: newNotification.message,
            })

            // If there's an action URL, handle it separately
            if (newNotification.action_url) {
              // We could implement this functionality in a different way if needed
              console.log("Action URL:", newNotification.action_url)
            }
          },
        )
        .subscribe()

      // Clean up subscription
      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupRealtimeSubscription()

    // Set up polling as a fallback (every 30 seconds)
    const pollingInterval = setInterval(fetchNotifications, 30000)

    return () => {
      clearInterval(pollingInterval)
      if (cleanup) {
        cleanup.then((unsub) => unsub)
      }
    }
  }, [supabase])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
