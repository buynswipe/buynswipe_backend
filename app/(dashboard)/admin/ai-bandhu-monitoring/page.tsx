"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface Conversation {
  id: string
  userId: string
  role: string
  messageCount: number
  sentiment: "positive" | "neutral" | "negative"
  language: string
  status: "active" | "completed"
  startTime: string
  endTime?: string
}

interface SystemHealth {
  apiStatus: "healthy" | "degraded" | "down"
  dbStatus: "healthy" | "degraded" | "down"
  avgResponseTime: number
  totalConversations: number
  activeConversations: number
}

export default function AIBandhuMonitoring() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setIsLoading(true)
        const [conversationsRes, healthRes] = await Promise.all([
          fetch("/api/ai-bandhu/monitoring/conversations"),
          fetch("/api/ai-bandhu/monitoring/health"),
        ])

        if (conversationsRes.ok) {
          const convData = await conversationsRes.json()
          setConversations(convData)
        }

        if (healthRes.ok) {
          const healthData = await healthRes.json()
          setSystemHealth(healthData)
        }
      } catch (error) {
        console.error("Failed to fetch monitoring data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonitoringData()
    const interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const filteredConversations = selectedRole ? conversations.filter((c) => c.role === selectedRole) : conversations

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusIcon = (status: SystemHealth["apiStatus"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">AI Bandhu System Monitoring</h1>
        <p className="text-slate-600 mt-1">Monitor conversations and system health</p>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getStatusIcon(systemHealth.apiStatus)} API Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={systemHealth.apiStatus === "healthy" ? "default" : "secondary"}>
                {systemHealth.apiStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getStatusIcon(systemHealth.dbStatus)} Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={systemHealth.dbStatus === "healthy" ? "default" : "secondary"}>
                {systemHealth.dbStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.avgResponseTime}ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.totalConversations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{systemHealth.activeConversations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter by Role</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button
            variant={selectedRole === null ? "default" : "outline"}
            onClick={() => setSelectedRole(null)}
            size="sm"
          >
            All Roles
          </Button>
          {["retailer", "wholesaler", "delivery"].map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              onClick={() => setSelectedRole(role)}
              size="sm"
              className="capitalize"
            >
              {role}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Conversations</CardTitle>
          <CardDescription>{filteredConversations.length} conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      No conversations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConversations.slice(0, 20).map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-mono text-sm">{conv.userId.substring(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{conv.role}</TableCell>
                      <TableCell>{conv.messageCount}</TableCell>
                      <TableCell>
                        <Badge className={getSentimentColor(conv.sentiment)}>{conv.sentiment}</Badge>
                      </TableCell>
                      <TableCell>{conv.language === "hi" ? "हिंदी" : "English"}</TableCell>
                      <TableCell>
                        <Badge variant={conv.status === "active" ? "default" : "secondary"}>{conv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(conv.startTime).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
