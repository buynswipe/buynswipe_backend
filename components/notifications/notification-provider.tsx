"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  actionUrl?: string
}

const NotificationContext = createContext<{
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
}>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Subscribe to real-time notifications
        const subscription = supabase
          .from(`notifications:user_id=eq.${session.user.id}`)
          .on("INSERT", (payload) => {
            const notification = payload.new as Notification
            setNotifications((prev) => [notification, ...prev])

            // Show toast based on priority
            if (notification.priority === "high") {
              toast.error(notification.title, {
                description: notification.message,
                action: notification.actionUrl
                  ? {
                      label: "View",
                      onClick: () => router.push(notification.actionUrl!),
                    }
                  : undefined,
              })
            } else {
              toast.info(notification.title, {
                description: notification.message,
              })
            }
          })
          .subscribe()

        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission()
        }

        // Subscribe to push notifications
        if ("serviceWorker" in navigator && "PushManager" in window) {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.getSubscription()

          if (!subscription) {
            const newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            })

            await fetch("/api/notifications/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription: newSubscription }),
            })
          }
        }

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Notification setup error:", error)
      }
    }

    setupNotifications()
  }, [supabase, router])

  const unreadCount = notifications.filter((n) => !n.id).length

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, id } : n)))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
