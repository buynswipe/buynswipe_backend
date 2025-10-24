"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { TrendingUp, MessageSquare, Target, Award } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export default function AIBandhuAnalytics() {
  const [conversationTrends, setConversationTrends] = useState<any[]>([])
  const [roleDistribution, setRoleDistribution] = useState<any[]>([])
  const [languageStats, setLanguageStats] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    averageResponseTime: 0,
    hindiUsage: 0,
    topRole: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      // Get last 7 days of conversations
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: conversations, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString())

      if (error) throw error

      // Process conversation trends
      const trendMap: Record<string, number> = {}
      const roleMap: Record<string, number> = {}
      let hindiCount = 0
      const totalCount = conversations?.length || 0

      conversations?.forEach((conv) => {
        const date = new Date(conv.created_at).toLocaleDateString()
        trendMap[date] = (trendMap[date] || 0) + 1
        roleMap[conv.role] = (roleMap[conv.role] || 0) + 1
        if (conv.detected_language === "hi") hindiCount++
      })

      const trends = Object.entries(trendMap).map(([date, count]) => ({
        date,
        conversations: count,
      }))

      const roleData = Object.entries(roleMap).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: count,
      }))

      const languageData = [
        { name: "Hindi", value: hindiCount },
        { name: "English", value: totalCount - hindiCount },
      ]

      setConversationTrends(trends)
      setRoleDistribution(roleData)
      setLanguageStats(languageData)

      const topRole = Object.entries(roleMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "retailer"

      setMetrics({
        totalConversations: totalCount,
        averageResponseTime: 1.2, // Mock value
        hindiUsage: totalCount > 0 ? Math.round((hindiCount / totalCount) * 100) : 0,
        topRole: topRole.charAt(0).toUpperCase() + topRole.slice(1),
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Analytics error:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">लोड हो रहा है... | Loading...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">AI Bandhu Analytics</h1>
        <p className="text-gray-600">आपके AI सहायक का विश्लेषण | AI Assistant Performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              कुल बातचीत | Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConversations}</div>
            <p className="text-xs text-gray-500 mt-1">पिछले 7 दिनों में | Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              हिंदी उपयोग | Hindi Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.hindiUsage}%</div>
            <p className="text-xs text-gray-500 mt-1">सभी बातचीत | All conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              शीर्ष भूमिका | Top Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.topRole}</div>
            <p className="text-xs text-gray-500 mt-1">सबसे सक्रिय | Most active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              औसत प्रतिक्रिया | Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}s</div>
            <p className="text-xs text-gray-500 mt-1">प्रति संदेश | Per message</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>बातचीत की प्रवृत्ति | Conversation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>भूमिका वितरण | Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Language Stats */}
      <Card>
        <CardHeader>
          <CardTitle>भाषा सांख्यिकी | Language Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={languageStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
