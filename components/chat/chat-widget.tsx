"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, ThumbsUp, ThumbsDown, AlertTriangle, X } from "lucide-react"
import { useChatContext } from "@/contexts/chat-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChatMigrationAlert } from "./chat-migration-alert"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatTablesExist, setChatTablesExist] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages, sendMessage, loading, provideFeedback, escalateToHuman } = useChatContext()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkChatTables = async () => {
      try {
        // Try to query the conversations table
        const { error } = await supabase.from("conversations").select("id").limit(1)

        // If there's an error about the table not existing, set chatTablesExist to false
        if (error && error.message.includes('relation "conversations" does not exist')) {
          setChatTablesExist(false)
        }
      } catch (error) {
        console.error("Error checking chat tables:", error)
      }
    }

    checkChatTables()
  }, [supabase])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [isOpen, messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessage(message)
      setMessage("")
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  if (!chatTablesExist) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={toggleChat} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>

        {isOpen && (
          <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <h3 className="font-semibold">Chat Support</h3>
              <Button variant="ghost" size="icon" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <ChatMigrationAlert />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={toggleChat} size="icon" className="h-12 w-12 rounded-full shadow-lg">
        <MessageCircle className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <h3 className="font-semibold">Chat Support</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-80 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>Send a message to get started</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      {msg.role === "assistant" && !msg.feedback && (
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => provideFeedback(msg.id, "helpful")}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => provideFeedback(msg.id, "not_helpful")}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {msg.feedback && (
                        <div className="mt-1 text-xs text-right">
                          {msg.feedback === "helpful" ? "Marked as helpful" : "Marked as not helpful"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            {loading && (
              <div className="flex justify-start mt-4">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-75"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={loading || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
          <div className="px-4 pb-4">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={escalateToHuman}>
              <AlertTriangle className="mr-2 h-3 w-3" />
              Speak to a human agent
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
