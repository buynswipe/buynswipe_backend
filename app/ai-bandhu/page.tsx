"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { getAIBandhuConfig } from "@/lib/ai-bandhu/role-config"

export default function AIBandhuPage() {
  const router = useRouter()
  const { profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && profile) {
      const config = getAIBandhuConfig(profile.role)
      if (config) {
        router.push(config.dashboardPath)
      } else {
        router.push("/dashboard")
      }
    }
  }, [profile, loading, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading AI Bandhu...</p>
      </div>
    </div>
  )
}
