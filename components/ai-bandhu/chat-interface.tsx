"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import type { AIBandhuMessage, AIBandhuConversation } from "@/lib/ai-bandhu/types"

interface ChatInterfaceProps {
  conversation: AIBandhuConversation
  onMessageSent?: () => void
}

export function ChatInterface({ conversation, onMessageSent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AIBandhuMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages()
  }, [conversation.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchMessages() {
    try {
      setIsFetching(true)
      const response = await fetch(`/api/ai-bandhu/chat/messages?conversationId=${conversation.id}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsFetching(false)
    }
  }

  async function handleSendMessage() {
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-bandhu/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: userMessage,
          language: conversation.language,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      // Add both user and AI messages to the list
      setMessages((prev) => [
        ...prev,
        {
          id: "temp-user",
          conversation_id: conversation.id,
          sender_type: "user",
          sender_id: null,
          content: userMessage,
          language: conversation.language,
          message_type: "text",
          created_at: new Date().toISOString(),
          metadata: {},
        },
        {
          id: data.messageId,
          conversation_id: conversation.id,
          sender_type: "ai",
          sender_id: null,
          content: data.aiMessage,
          language: conversation.language,
          message_type: "text",
          created_at: new Date().toISOString(),
          metadata: {},
        },
      ])

      onMessageSent?.()
    } catch (error) {
      console.error("Error sending message:", error)
      // Re-add the user message if there was an error
      setInputValue(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation with AI Bandhu</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-xs lg:max-w-md px-4 py-2 ${
                  message.sender_type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
