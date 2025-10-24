"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AIBandhuMonitoring() {
  const [conversations, setConversations] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState({
    apiStatus: "healthy",
    dbStatus: "healthy",
    lastChecked: new Date(),
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchConversations() {
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setConversations(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Fetch error:", error)
      setIsLoading(false)
    }
  }

  async function checkSystemHealth() {
    try {
      // Check API health
      const apiResponse = await fetch("/api/ai-bandhu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "test",
          role: "retailer",
        }),
      }).catch(() => null)

      // Check DB connection
      const { error: dbError } = await supabase.from("ai_conversations").select("count").limit(1)

      setSystemHealth({
        apiStatus: apiResponse ? "healthy" : "degraded",
        dbStatus: dbError ? "degraded" : "healthy",
        lastChecked: new Date(),
      })
    } catch (error) {
      console.error("Health check error:", error)
    }
  }

  const getRoleColor = (role: string) => {
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

  const getLanguageLabel = (lang: string) => (lang === "hi" ? "हिंदी" : "English")

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">AI Bandhu Monitoring</h1>
        <p className="text-gray-600">सिस्टम स्वास्थ्य और बातचीत ट्रैकिंग | System Health & Conversation Tracking</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              {systemHealth.apiStatus === "healthy" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              API स्थिति | API Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemHealth.apiStatus === "healthy" ? "default" : "destructive"}>
              {systemHealth.apiStatus === "healthy" ? "स्वस्थ | Healthy" : "क्षीण | Degraded"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              {systemHealth.dbStatus === "healthy" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              डेटाबेस स्थिति | Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemHealth.dbStatus === "healthy" ? "default" : "destructive"}>
              {systemHealth.dbStatus === "healthy" ? "स्वस्थ | Healthy" : "क्षीण | Degraded"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              अंतिम जांच | Last Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{systemHealth.lastChecked.toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>सक्रिय बातचीत | Active Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500">लोड हो रहा है... | Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>भूमिका | Role</TableHead>
                  <TableHead>उपयोगकर्ता संदेश | User Message</TableHead>
                  <TableHead>सहायक प्रतिक्रिया | Assistant Response</TableHead>
                  <TableHead>भाषा | Language</TableHead>
                  <TableHead>समय | Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell>
                      <Badge className={getRoleColor(conv.role)}>{conv.role.split("_").join(" ")}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{conv.user_message}</TableCell>
                    <TableCell className="max-w-xs truncate">{conv.assistant_response}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getLanguageLabel(conv.detected_language)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(conv.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
