"use client"

import type React from "react"

import { LayoutDashboard, Package, Settings, ShoppingBag, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getNavigationItems } from "@/lib/navigation-data"
import { SidebarNav } from "@/components/navigation/sidebar-nav"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [navItems, setNavItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUserRole() {
      try {
        setLoading(true)
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setLoading(false)
          return
        }

        // Get user profile
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (profile) {
          setUserRole(profile.role)

          // If user is a delivery partner, redirect to delivery dashboard
          if (profile.role === "delivery_partner") {
            window.location.href = "/delivery-partner/dashboard"
            return
          }

          // Get navigation items based on role
          const items = getNavigationItems(profile.role)
          setNavItems(items)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching user role:", error)
        setLoading(false)
      }
    }

    getUserRole()
  }, [supabase])

  // If user is a delivery partner, don't render the sidebar
  if (userRole === "delivery_partner") {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className={cn("pb-12", className)}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Retail Bandhu</h2>
            <div className="space-y-1 px-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-md bg-gray-200"></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Retail Bandhu</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <SidebarNav items={navItems} className="px-2" />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Add the DashboardSidebar export as an alias to maintain compatibility
export const DashboardSidebar = Sidebar

const sidebarConfig = {
  items: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Products",
      href: "/manage-products",
      icon: <Package className="h-5 w-5" />,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Orders",
      href: "/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
  ],
}

export { sidebarConfig }
