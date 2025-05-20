"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/types/database.types"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard" }: RoleGuardProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (profile && allowedRoles.includes(profile.role as UserRole)) {
        setHasAccess(true)
      } else {
        // Redirect based on role if not allowed
        if (profile?.role === "delivery_partner") {
          router.push("/delivery-partner/dashboard")
        } else if (profile?.role === "wholesaler") {
          router.push("/wholesaler-dashboard")
        } else if (profile?.role === "retailer") {
          router.push("/dashboard/main")
        } else if (profile?.role === "admin") {
          router.push("/dashboard/main")
        } else {
          router.push(redirectTo)
        }
      }
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking access...</span>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
