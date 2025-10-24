"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Loader2 } from "lucide-react"

interface Analytics {
  conversationCount: number
  totalMessages: number
  avgSentiment: string
  languageBreakdown: { language: string; count: number }[]
  roleDistribution: { role: string; count: number }[]
  dailyTrends: { date: string; conversations: number }[]
  recommendationTypes: { type: string; count: number }[]
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"7d" | "30d">("7d")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/ai-bandhu/analytics?timeframe=${timeframe}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeframe])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!analytics) {
    return <div className="p-6 text-center">Failed to load analytics</div>
  }

  const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fcd34d", "#fef3c7"]

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Bandhu Analytics</h1>
          <p className="text-slate-600 mt-1">Track AI assistant performance and usage</p>
        </div>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "7d" | "30d")}>
          <TabsList>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.conversationCount}</div>
            <p className="text-xs text-slate-500 mt-1">Total conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalMessages}</div>
            <p className="text-xs text-slate-500 mt-1">Total messages sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.avgSentiment}</div>
            <p className="text-xs text-slate-500 mt-1">User satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Messages/Conv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(analytics.totalMessages / analytics.conversationCount).toFixed(1)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Engagement depth</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation Trends</CardTitle>
            <CardDescription>Daily conversations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="conversations" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Conversations by user role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count }) => `${role}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.roleDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Language Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Language Preference</CardTitle>
            <CardDescription>Hindi vs English usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.languageBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="language" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Types</CardTitle>
            <CardDescription>Most requested assistance types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recommendationTypes.map((rec) => (
                <div key={rec.type} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{rec.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${(rec.count / Math.max(...analytics.recommendationTypes.map((r) => r.count))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8">{rec.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
