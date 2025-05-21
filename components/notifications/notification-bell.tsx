"use client"

import * as React from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function NotificationBell() {
  const [open, setOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const supabase = createClientComponentClient()

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true)
      
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      if (!session) return
      
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  React.useEffect(() => {
    fetchNotifications()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        fetchNotifications()
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      if (!session) return
      
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.user.id)
        .eq("read", false)
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">O</div>
      case "payment":
        return <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success">P</div>
      case "inventory":
        return <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">I</div>
      case "system":
        return <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center text-info">S</div>
      default:
        return <div className="h-8 w-8 rounded-full bg-muted flex items-center justify\
