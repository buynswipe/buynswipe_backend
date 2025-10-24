"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, MessageSquare, Clock } from "lucide-react"

interface Conversation {
  id: string
  title: string
  role: string
  messageCount: number
  createdAt: string
  updatedAt: string
  lastMessage?: string
}

export default function ChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv_1",
      title: "Order Management Strategies",
      role: "retailer",
      messageCount: 12,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15 10:30 AM",
      lastMessage: "Thanks for the pricing recommendation!",
    },
    {
      id: "conv_2",
      title: "Inventory Planning Discussion",
      role: "wholesaler",
      messageCount: 8,
      createdAt: "2024-01-14",
      updatedAt: "2024-01-14 3:15 PM",
      lastMessage: "I'll implement the demand forecast",
    },
    {
      id: "conv_3",
      title: "Route Optimization Tips",
      role: "delivery_partner",
      messageCount: 15,
      createdAt: "2024-01-13",
      updatedAt: "2024-01-13 5:45 PM",
      lastMessage: "Route saved 12 minutes today!",
    },
    {
      id: "conv_4",
      title: "Growth Strategy Chat",
      role: "retailer",
      messageCount: 6,
      createdAt: "2024-01-12",
      updatedAt: "2024-01-12 2:20 PM",
      lastMessage: "Which products should I focus on?",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")

  const filteredConversations = conversations.filter((conv) => {
    const roleMatch = selectedRole === "all" || conv.role === selectedRole
    const searchMatch = conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    return roleMatch && searchMatch
  })

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "retailer":
        return "bg-blue-100 text-blue-800"
      case "wholesaler":
        return "bg-green-100 text-green-800"
      case "delivery_partner":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Chat History</h1>
        <p className="text-gray-600 mt-2">View and manage your AI Bandhu conversations</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Roles</option>
          <option value="retailer">Retailer</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="delivery_partner">Delivery Partner</option>
        </select>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conv) => (
            <Card key={conv.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{conv.title}</h3>
                      <Badge className={getRoleBadgeColor(conv.role)}>
                        {conv.role === "delivery_partner" ? "Delivery Partner" : conv.role}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{conv.lastMessage}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {conv.messageCount} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conv.updatedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Resume
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteConversation(conv.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredConversations.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Your Chat Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
                <p className="text-sm text-blue-800">Total Conversations</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {conversations.reduce((sum, c) => sum + c.messageCount, 0)}
                </div>
                <p className="text-sm text-blue-800">Messages Exchanged</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(conversations.reduce((sum, c) => sum + c.messageCount, 0) / conversations.length)}
                </div>
                <p className="text-sm text-blue-800">Avg Messages/Chat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
