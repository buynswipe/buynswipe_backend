"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, usePathname } from "next/navigation"

type NavigationContextType = {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  userRole: string | null
}

const NavigationContext = createContext<NavigationContextType>({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  userRole: null,
})

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

          setUserRole(profile?.role || null)

          // Redirect delivery partners to the delivery dashboard if they're on a retailer page
          if (profile?.role === "delivery_partner" && pathname === "/dashboard") {
            console.log("Redirecting delivery partner from dashboard to /delivery")
            router.push("/delivery")
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error)
      }
    }

    checkUserRole()
  }, [supabase, router, pathname])

  return (
    <NavigationContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar, userRole }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  return useContext(NavigationContext)
}
