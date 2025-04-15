"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  feedback?: "helpful" | "not_helpful"
}

type ChatContextType = {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  loading: boolean
  provideFeedback: (messageId: string, feedback: "helpful" | "not_helpful") => Promise<void>
  escalateToHuman: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    // Load existing conversation or create a new one
    const loadConversation = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Check if user has an active conversation
        const { data: conversations, error: conversationsError } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)

        if (conversationsError) {
          // If the error is because the table doesn't exist, we'll handle it elsewhere
          if (!conversationsError.message.includes('relation "conversations" does not exist')) {
            console.error("Error loading conversation:", conversationsError)
          }
          return
        }

        if (conversations && conversations.length > 0) {
          // Use existing conversation
          setConversationId(conversations[0].id)

          // Load messages for this conversation
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversations[0].id)
            .order("created_at", { ascending: true })

          if (messagesError) {
            console.error("Error loading messages:", messagesError)
            return
          }

          if (messagesData) {
            setMessages(messagesData)
          }
        } else {
          // Create a new conversation
          const { data: newConversation, error: newConversationError } = await supabase
            .from("conversations")
            .insert([{ user_id: session.user.id }])
            .select()

          if (newConversationError) {
            console.error("Error creating conversation:", newConversationError)
            return
          }

          if (newConversation && newConversation.length > 0) {
            setConversationId(newConversation[0].id)

            // Add a welcome message
            const welcomeMessage = {
              conversation_id: newConversation[0].id,
              role: "assistant" as const,
              content: "Hello! How can I help you today?",
            }

            const { data: welcomeData, error: welcomeError } = await supabase
              .from("messages")
              .insert([welcomeMessage])
              .select()

            if (welcomeError) {
              console.error("Error adding welcome message:", welcomeError)
              return
            }

            if (welcomeData) {
              setMessages(welcomeData)
            }
          }
        }
      } catch (error) {
        console.error("Error in loadConversation:", error)
      }
    }

    loadConversation()
  }, [supabase])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    try {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to use the chat",
          variant: "destructive",
        })
        return
      }

      // If we don't have a conversation yet, create one
      let currentConversationId = conversationId
      if (!currentConversationId) {
        const { data: newConversation, error: newConversationError } = await supabase
          .from("conversations")
          .insert([{ user_id: session.user.id }])
          .select()

        if (newConversationError) {
          console.error("Error creating conversation:", newConversationError)
          toast({
            title: "Error",
            description: "Failed to create conversation",
            variant: "destructive",
          })
          return
        }

        if (newConversation && newConversation.length > 0) {
          currentConversationId = newConversation[0].id
          setConversationId(currentConversationId)
        }
      }

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
      }
      setMessages((prev) => [...prev, tempUserMessage])

      // Save user message to database
      const { data: userMessageData, error: userMessageError } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: currentConversationId,
            role: "user",
            content,
          },
        ])
        .select()

      if (userMessageError) {
        console.error("Error saving user message:", userMessageError)
        toast({
          title: "Error",
          description: "Failed to save your message",
          variant: "destructive",
        })
        return
      }

      // Get response from API
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationId: currentConversationId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const responseData = await response.json()

      // Add assistant message to UI
      if (responseData.message) {
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== tempUserMessage.id),
          userMessageData[0],
          responseData.message,
        ])
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const provideFeedback = async (messageId: string, feedback: "helpful" | "not_helpful") => {
    try {
      // Update the message in the UI
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))

      // Save feedback to database
      const response = await fetch("/api/chat/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          feedback,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save feedback")
      }
    } catch (error) {
      console.error("Error providing feedback:", error)
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      })
    }
  }

  const escalateToHuman = async () => {
    if (!conversationId) return

    try {
      // Update conversation status
      const { error } = await supabase.from("conversations").update({ status: "escalated" }).eq("id", conversationId)

      if (error) {
        throw error
      }

      // Notify the user
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "Your conversation has been escalated to a human agent. Someone will get back to you soon.",
      }
      setMessages((prev) => [...prev, systemMessage])

      // Save system message to database
      await supabase.from("messages").insert([
        {
          conversation_id: conversationId,
          role: "system",
          content: systemMessage.content,
        },
      ])

      // Notify admin via API
      await fetch("/api/chat/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
        }),
      })

      toast({
        title: "Conversation Escalated",
        description: "A human agent will get back to you soon.",
      })
    } catch (error) {
      console.error("Error escalating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to escalate conversation",
        variant: "destructive",
      })
    }
  }

  return (
    <ChatContext.Provider value={{ messages, sendMessage, loading, provideFeedback, escalateToHuman }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
