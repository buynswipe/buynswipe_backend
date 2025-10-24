"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIBandhuFloatingButton } from "@/components/ai-bandhu/floating-button"
import { BarChart3, TrendingUp, Users, PieChart } from "lucide-react"
import { WholesalerDashboardWidgets } from "@/components/ai-bandhu/wholesaler-dashboard-widgets"

export default function WholesalerAIBandhuPage() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (profile?.role !== "wholesaler") {
          router.push("/dashboard")
          return
        }

        setUserRole(profile.role)
      } catch (error) {
        console.error("Error checking role:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkRole()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (userRole !== "wholesaler") {
    return null
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          नमस्ते! आपका AI Bandhu यहाँ है | Welcome to Wholesaler AI Bandhu
        </h1>
        <p className="text-gray-600">
          ऑर्डर प्रबंधन, मूल्य निर्धारण, और पूर्वानुमान | Order management, pricing, and forecasting
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-5 h-5 text-blue-600" />
              ऑर्डर्स | Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">सभी खुले ऑर्डर्स देखें</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">देखें | View</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              मूल्य निर्धारण | Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">गतिशील मूल्य सेट करें</p>
            <Button variant="outline" className="w-full bg-transparent">
              प्रबंधित करें | Manage
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-green-500" />
              पूर्वानुमान | Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">बिक्री के ट्रेंड्स जानें</p>
            <Button variant="outline" className="w-full bg-transparent">
              विश्लेषण | Analyze
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-purple-500" />
              खुदरा विक्रेता | Retailers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">अपने नेटवर्क को प्रबंधित करें</p>
            <Button variant="outline" className="w-full bg-transparent">
              देखें | View
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Bandhu की इनसाइट्स | Smart Insights</CardTitle>
          <CardDescription>आपके व्यापार के लिए डेटा-संचालित सिफारिशें</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💹 मांग पूर्वानुमान | Demand Forecast</h3>
              <p className="text-sm text-blue-800">
                अगले सप्ताह "बिस्कुट" की मांग 25% बढ़ने की संभावना है। अपने स्टॉक को तदनुसार बढ़ाएं।
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🎯 ऑप्टिमाल प्राइसिंग | Optimal Pricing</h3>
              <p className="text-sm text-green-800">
                "Tata Salt" के लिए ₹25 की कीमत सर्वोत्तम ROI देगी। मूल्य अपडेट करने की सिफारिश।
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Widgets */}
      <div className="mt-12">
        <WholesalerDashboardWidgets />
      </div>

      {/* Floating AI Button */}
      <AIBandhuFloatingButton role="wholesaler" />
    </div>
  )
}
