"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIBandhuFloatingButton } from "@/components/ai-bandhu/floating-button"
import { MapPin, TrendingUp, Clock, DollarSign } from "lucide-react"
import { DeliveryDashboardWidgets } from "@/components/ai-bandhu/delivery-dashboard-widgets"

export default function DeliveryPartnerAIBandhuPage() {
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

        if (profile?.role !== "delivery_partner") {
          router.push("/delivery-partner/dashboard")
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

  if (userRole !== "delivery_partner") {
    return null
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          नमस्ते! आपका AI Bandhu यहाँ है | Welcome to Delivery Partner AI Bandhu
        </h1>
        <p className="text-gray-600">
          रूट ऑप्टिमाइजेशन, कार्य अपडेट्स, और कमाई ट्रैकिंग | Route optimization, tasks, and earnings
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-blue-600" />
              रूट | Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">अनुकूलित रूट देखें</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">शुरू करें | Start</Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-orange-500" />
              कार्य | Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">आज के डिलीवरी कार्य</p>
            <Button variant="outline" className="w-full bg-transparent">
              देखें | View
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-5 h-5 text-green-500" />
              कमाई | Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">आपकी कमाई ट्रैक करें</p>
            <Button variant="outline" className="w-full bg-transparent">
              विवरण | Details
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              प्रदर्शन | Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">आपकी रेटिंग और आंकड़े</p>
            <Button variant="outline" className="w-full bg-transparent">
              देखें | View
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>AI Bandhu की सिफारिशें | Smart Optimization</CardTitle>
          <CardDescription>आपकी दक्षता बढ़ाने के लिए स्मार्ट सुझाव</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">🗺️ रूट अनुकूलन | Route Optimization</h3>
              <p className="text-sm text-blue-800">
                आपके वर्तमान रूट को 15 मिनट कम किया जा सकता है। नया रूट देखने के लिए यहाँ क्लिक करें।
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">💰 कमाई बढ़ने की संभावना | Earning Opportunity</h3>
              <p className="text-sm text-green-800">आप आज 3 अतिरिक्त डिलीवरी कर सकते हैं। ₹500+ अतिरिक्त कमाने का मौका।</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Widgets */}
      <div className="mt-12">
        <DeliveryDashboardWidgets />
      </div>

      {/* Floating AI Button */}
      <AIBandhuFloatingButton role="delivery_partner" />
    </div>
  )
}
