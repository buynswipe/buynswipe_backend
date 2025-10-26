"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, MessageSquare, Mic, BarChart3, Truck, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/ai-bandhu/chat-interface"
import { VoiceChatInterface } from "@/components/ai-bandhu/voice-chat-interface"
import type { AIBandhuConversation } from "@/lib/ai-bandhu/types"

export default function WholesalerAIBandhuPage() {
  const { user, profile, loading } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)
  const [conversations, setConversations] = useState<AIBandhuConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<AIBandhuConversation | null>(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")

  useEffect(() => {
    if (!loading) {
      setIsInitializing(false)
      fetchConversations()
    }
  }, [loading])

  async function fetchConversations() {
    try {
      setIsLoadingConversations(true)
      const response = await fetch("/api/ai-bandhu/chat/conversations")
      if (!response.ok) throw new Error("Failed to fetch conversations")
      const data = await response.json()
      setConversations(data.conversations || [])

      if (data.conversations?.length > 0 && !activeConversation) {
        setActiveConversation(data.conversations[0])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  async function handleCreateConversation() {
    try {
      const response = await fetch("/api/ai-bandhu/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Chat - ${new Date().toLocaleDateString()}`,
          language: "en",
        }),
      })

      if (!response.ok) throw new Error("Failed to create conversation")
      const data = await response.json()
      const newConversation = data.conversation

      setConversations((prev) => [newConversation, ...prev])
      setActiveConversation(newConversation)
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Initializing Wholesaler Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Bandhu - Wholesaler Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome, {profile?.business_name}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <Button size="sm" onClick={handleCreateConversation} disabled={isLoadingConversations}>
                  +
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        activeConversation?.id === conv.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <p className="truncate font-medium">{conv.title || "Untitled"}</p>
                      <p className="text-xs opacity-75">{new Date(conv.created_at).toLocaleDateString()}</p>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {activeConversation ? (
              <Card className="p-4 h-96 lg:h-full flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Text Chat
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="gap-2">
                      <Mic className="h-4 w-4" />
                      Voice Chat
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 flex flex-col">
                    <ChatInterface conversation={activeConversation} onMessageSent={fetchConversations} />
                  </TabsContent>

                  <TabsContent value="voice" className="flex-1 flex flex-col">
                    <VoiceChatInterface conversation={activeConversation} onMessageSent={fetchConversations} />
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <Card className="p-8 flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No conversation selected</p>
                  <Button onClick={handleCreateConversation}>Start New Conversation</Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Inventory Insights</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get AI-powered analysis of your inventory levels, trends, and optimization recommendations.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Delivery Coordination</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage delivery partners and optimize delivery routes with AI assistance.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Order Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Voice-enabled order management and real-time alerts for important updates.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
