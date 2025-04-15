"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  order_id?: string
  created_at: string
  read: boolean
  sender_name?: string
  sender_role?: string
}

interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_role: string
  last_message?: string
  last_message_time?: string
  unread_count: number
}

interface MessagingContextType {
  messages: Message[]
  conversations: Conversation[]
  activeConversation: string | null
  isLoading: boolean
  error: string | null

  sendMessage: (recipientId: string, content: string, orderId?: string) => Promise<boolean>
  fetchMessages: (conversationId: string) => Promise<void>
  fetchConversations: () => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  setActiveConversation: (conversationId: string | null) => void
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { data, error: conversationsError } = await supabase
        .from("conversations")
        .select(`
          *,
          participant:profiles!participant_id(business_name, role)
        `)
        .or(`user_id.eq.${session.user.id},participant_id.eq.${session.user.id}`)
        .order("updated_at", { ascending: false })

      if (conversationsError) throw conversationsError

      // Format conversations
      const formattedConversations = data.map((conv: any) => ({
        id: conv.id,
        participant_id: conv.participant_id === session.user.id ? conv.user_id : conv.participant_id,
        participant_name: conv.participant.business_name,
        participant_role: conv.participant.role,
        last_message: conv.last_message,
        last_message_time: conv.updated_at,
        unread_count: conv.unread_count || 0,
      }))

      setConversations(formattedConversations)
    } catch (error: any) {
      console.error("Error fetching conversations:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(business_name, role)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (messagesError) throw messagesError

      // Format messages
      const formattedMessages = data.map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        order_id: msg.order_id,
        created_at: msg.created_at,
        read: msg.read,
        sender_name: msg.sender.business_name,
        sender_role: msg.sender.role,
      }))

      setMessages(formattedMessages)

      // Mark messages as read
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const unreadMessages = formattedMessages
          .filter((msg) => !msg.read && msg.recipient_id === session.user.id)
          .map((msg) => msg.id)

        if (unreadMessages.length > 0) {
          await supabase.from("messages").update({ read: true }).in("id", unreadMessages)

          // Update conversation unread count
          await supabase.from("conversations").update({ unread_count: 0 }).eq("id", conversationId)

          // Update local state
          fetchConversations()
        }
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Send a message
  const sendMessage = async (recipientId: string, content: string, orderId?: string) => {
    try {
      setIsLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to send messages")
      }

      // Find or create conversation
      let conversationId: string

      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user_id.eq.${session.user.id},participant_id.eq.${recipientId}),and(user_id.eq.${recipientId},participant_id.eq.${session.user.id})`,
        )
        .maybeSingle()

      if (existingConversation) {
        conversationId = existingConversation.id
      } else {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            user_id: session.user.id,
            participant_id: recipientId,
            last_message: content,
            unread_count: 1,
          })
          .select()
          .single()

        if (convError) throw convError

        conversationId = newConversation.id
      }

      // Insert message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        recipient_id: recipientId,
        content,
        order_id: orderId,
        read: false,
      })

      if (msgError) throw msgError

      // Update conversation
      await supabase
        .from("conversations")
        .update({
          last_message: content,
          updated_at: new Date().toISOString(),
          unread_count: supabase.sql`unread_count + 1`,
        })
        .eq("id", conversationId)

      // Refresh messages if this is the active conversation
      if (activeConversation === conversationId) {
        fetchMessages(conversationId)
      }

      // Refresh conversations
      fetchConversations()

      return true
    } catch (error: any) {
      console.error("Error sending message:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase.from("messages").update({ read: true }).eq("id", messageId)

      if (error) throw error

      // Update local state
      setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)))
    } catch (error: any) {
      console.error("Error marking message as read:", error)
    }
  }

  // Set up real-time subscription for new messages
  useEffect(() => {
    const {
      data: { session },
    } = supabase.auth.getSession()

    if (!session) return

    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${session.user.id}`,
        },
        (payload) => {
          // Refresh conversations
          fetchConversations()

          // If this is for the active conversation, refresh messages
          if (activeConversation && payload.new.conversation_id === activeConversation) {
            fetchMessages(activeConversation)
          } else {
            // Show notification
            toast({
              title: "New Message",
              description: "You have received a new message",
            })
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, activeConversation, fetchConversations])

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation)
    }
  }, [activeConversation])

  const value = {
    messages,
    conversations,
    activeConversation,
    isLoading,
    error,
    sendMessage,
    fetchMessages,
    fetchConversations,
    markAsRead,
    setActiveConversation,
  }

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
}

export function useMessaging() {
  const context = useContext(MessagingContext)

  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }

  return context
}
