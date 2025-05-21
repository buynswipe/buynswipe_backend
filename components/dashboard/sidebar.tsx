"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getNavigationItems } from "@/lib/navigation-data"
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
  BarChart3,
  Bell,
  Truck,
  Store,
  CreditCard,
  MessageSquare,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [navItems, setNavItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
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
            <div className="mb-4 flex h-8 items-center px-4">
              <div className="h-6 w-6 rounded-full bg-primary/20 animate-pulse"></div>
              <div className="ml-2 h-4 w-24 rounded bg-muted animate-pulse"></div>
            </div>
            <div className="space-y-3 px-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-md bg-muted"></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  // Get navigation items based on user role
  const getNavItemsForRole = () => {
    if (userRole === "admin") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/orders", label: "Orders", icon: ShoppingBag },
        { href: "/products", label: "Products", icon: Package },
        { href: "/users", label: "Users", icon: Users },
        { href: "/inventory-alerts", label: "Inventory Alerts", icon: Bell },
        { href: "/delivery-partners", label: "Delivery Partners", icon: Truck },
      ]
    } else if (userRole === "wholesaler") {
      return [
        { href: "/wholesaler-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/order-management", label: "Order Management", icon: ShoppingBag },
        { href: "/products", label: "Products", icon: Package },
        { href: "/inventory-alerts", label: "Inventory Alerts", icon: Bell },
        { href: "/delivery-partners", label: "Delivery Partners", icon: Truck },
      ]
    } else if (userRole === "retailer") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/orders", label: "Orders", icon: ShoppingBag },
        { href: "/wholesalers", label: "Suppliers", icon: Store },
        { href: "/products", label: "Products", icon: Package },
        { href: "/payments", label: "Payments", icon: CreditCard },
      ]
    }

    // Default navigation
    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/orders", label: "Orders", icon: ShoppingBag },
      { href: "/products", label: "Products", icon: Package },
    ]
  }

  const mainNavItems = getNavItemsForRole()

  const secondaryNavItems = [
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help & Support", icon: HelpCircle },
  ]

  return (
    <div className={cn("flex h-full flex-col border-r bg-background", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">RB</span>
          </div>
          {!collapsed && <span className="font-semibold">Retail Bandhu</span>}
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        pathname === item.href || pathname?.startsWith(`${item.href}/`)
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "transparent",
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        pathname === item.href ? "bg-primary/10 text-primary hover:bg-primary/15" : "transparent",
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            ))}

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm font-medium"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {!collapsed && <span>Log out</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Log out</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// Add the DashboardSidebar export as an alias to maintain compatibility
export const DashboardSidebar = Sidebar
