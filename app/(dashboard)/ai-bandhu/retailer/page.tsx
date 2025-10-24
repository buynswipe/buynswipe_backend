"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIBandhuFloatingButton } from "@/components/ai-bandhu/floating-button"
import { BarChart3, TrendingUp, ShoppingCart, AlertCircle } from "lucide-react"
import { RetailerDashboardWidgets } from "@/components/ai-bandhu/retailer-dashboard-widgets"

export default function RetailerAIBandhuPage() {
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

        if (profile?.role !== "retailer") {
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

  if (userRole !== "retailer") {
    return null
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">नमस्ते! आपका AI Bandhu यहाँ है | Welcome to Retailer AI Bandhu</h1>
        <p className="text-gray-600">
          आपके ऑर्डर, इनवेंटरी और बिज़नेस इनसाइट्स के लिए | Smart ordering, inventory, and business insights
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              त्वरित ऑर्डर | Quick Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">वॉइस से अपना अगला ऑर्डर करें</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">शुरू करें | Start</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              इनवेंटरी | Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">अपने स्टॉक को ट्रैक करें</p>
            <Button variant="outline" className="w-full bg-transparent">
              देखें | View
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-green-500" />
              बिक्री Analytics | Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">आपकी बिक्री ट्रेंड्स देखें</p>
            <Button variant="outline" className="w-full bg-transparent">
              Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5 text-red-500" />
              अलर्ट्स | Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">महत्वपूर्ण अपडेट्स</p>
            <Button variant="outline" className="w-full bg-transparent">
              चेक करें | Check
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Bandhu की सिफारिशें | Smart Recommendations</CardTitle>
          <CardDescription>आपके बिज़नेस को बेहतर बनाने के लिए व्यक्तिगत सुझाव</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📦 स्टॉक अलर्ट | Low Stock Alert</h3>
              <p className="text-sm text-blue-800">आपके "Tata Salt" का स्टॉक कम हो रहा है। आज ही ऑर्डर करें और 5% छूट पाएं।</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">📈 बेस्टसेलर | Trending Product</h3>
              <p className="text-sm text-green-800">"Parle-G" बिस्कुट आपके क्षेत्र में ट्रेंडिंग है। स्टॉक बढ़ाने का सुझाव।</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Widgets */}
      <div className="mt-12">
        <RetailerDashboardWidgets />
      </div>

      {/* Floating AI Button */}
      <AIBandhuFloatingButton role="retailer" />
    </div>
  )
}
