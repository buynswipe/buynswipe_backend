"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { VoiceInput } from "./voice-input"
import { VoiceOutput } from "./voice-output"
import type { AIBandhuMessage, AIBandhuConversation } from "@/lib/ai-bandhu/types"

interface VoiceChatInterfaceProps {
  conversation: AIBandhuConversation
  onMessageSent?: () => void
}

export function VoiceChatInterface({ conversation, onMessageSent }: VoiceChatInterfaceProps) {
  const [messages, setMessages] = useState<AIBandhuMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [conversation.id])

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

  async function handleVoiceTranscript(transcript: string) {
    if (!transcript.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-bandhu/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: transcript,
          language: conversation.language,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          id: "temp-user",
          conversation_id: conversation.id,
          sender_type: "user",
          sender_id: null,
          content: transcript,
          language: conversation.language,
          message_type: "voice",
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

      setSelectedMessageId(data.messageId)
      onMessageSent?.()
    } catch (error) {
      console.error("Error sending voice message:", error)
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
            <p>Start a voice conversation with AI Bandhu</p>
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
                {message.sender_type === "ai" && (
                  <div className="mt-2">
                    <VoiceOutput text={message.content} language={conversation.language} />
                  </div>
                )}
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input Area */}
      <div className="border-t p-4 space-y-4">
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          language={conversation.language}
          conversationId={conversation.id}
        />
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  )
}
