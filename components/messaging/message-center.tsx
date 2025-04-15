"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, MessageSquare, ChevronLeft } from "lucide-react"
import { useMessaging } from "@/contexts/messaging-context"
import { formatDistanceToNow } from "date-fns"

export function MessageCenter() {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, conversations, activeConversation, isLoading, error, sendMessage, setActiveConversation } =
    useMessaging()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Format time
  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeConversation || !message.trim()) return

    const conversation = conversations.find((c) => c.id === activeConversation)

    if (!conversation) return

    await sendMessage(conversation.participant_id, message)
    setMessage("")
  }

  // Render conversation list
  const renderConversationList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (conversations.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No conversations yet</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-3 rounded-md cursor-pointer hover:bg-muted ${
              activeConversation === conversation.id ? "bg-muted" : ""
            }`}
            onClick={() => setActiveConversation(conversation.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{conversation.participant_name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {conversation.last_message || "No messages yet"}
                </p>
              </div>
              {conversation.unread_count > 0 && (
                <Badge className="bg-primary text-primary-foreground">{conversation.unread_count}</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render message thread
  const renderMessageThread = () => {
    if (!activeConversation) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Select a conversation to view messages</p>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    const conversation = conversations.find((c) => c.id === activeConversation)

    if (!conversation) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Conversation not found</p>
        </div>
      )
    }

    return (
      <>
        <CardHeader className="flex flex-row items-center p-4">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setActiveConversation(null)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-lg">{conversation.participant_name}</CardTitle>
            <CardDescription>{conversation.participant_role}</CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-4 h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === conversation.participant_id ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender_id === conversation.participant_id ? "bg-muted" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">{formatMessageTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="p-4">
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      <Card className={`md:col-span-1 ${activeConversation ? "hidden md:block" : ""}`}>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>{renderConversationList()}</CardContent>
      </Card>

      <Card className={`md:col-span-2 ${!activeConversation ? "hidden md:block" : ""}`}>{renderMessageThread()}</Card>
    </div>
  )
}
