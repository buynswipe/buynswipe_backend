"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  Store,
  Package,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Users,
  Truck,
  BellRing,
  Settings,
  ExternalLink,
  HelpCircle,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function getUserRole() {
      try {
        setLoading(true)
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
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching user role:", error)
        setLoading(false)
      }
    }

    getUserRole()
  }, [supabase])

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Structure navigation based on role
  const getNavigation = () => {
    const sharedItems = [
      {
        name: "Dashboard",
        href: userRole === "wholesaler" ? "/wholesaler-dashboard" : "/dashboard",
        icon: LayoutDashboard,
      },
    ]

    const retailerItems = [
      ...sharedItems,
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Wholesalers", href: "/wholesalers", icon: Store },
      { name: "Payments", href: "/payments", icon: TrendingUp },
      {
        name: "Products",
        href: "/manage-products",
        icon: Package,
      },
    ]

    const wholesalerItems = [
      ...sharedItems,
      {
        name: "Order Management",
        href: "/order-management",
        icon: ShoppingCart,
      },
      {
        name: "Products",
        href: "/manage-products",
        icon: Package,
      },
      {
        name: "Inventory Alerts",
        href: "/inventory-alerts",
        icon: BellRing,
        badge: "3",
      },
      {
        name: "Delivery Partners",
        href: "/delivery-partners",
        icon: Truck,
      },
    ]

    const adminItems = [
      ...sharedItems,
      { name: "Users", href: "/users", icon: Users },
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      {
        name: "Products",
        href: "/manage-products",
        icon: Package,
      },
      { name: "Payments", href: "/payments", icon: TrendingUp },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
      {
        name: "Delivery Partners",
        href: "/delivery-partners",
        icon: Truck,
      },
      {
        name: "Inventory Alerts",
        href: "/inventory-alerts",
        icon: BellRing,
        badge: "5",
      },
      {
        name: "Settings",
        href: "#",
        icon: Settings,
        children: [
          { name: "Payment Config", href: "/admin/payment-config", icon: Settings },
          { name: "System Fixes", href: "/admin/system-fixes", icon: Settings },
          { name: "Database Fixes", href: "/admin/database-fixes", icon: Lock },
        ],
      },
    ]

    switch (userRole) {
      case "retailer":
        return retailerItems
      case "wholesaler":
        return wholesalerItems
      case "admin":
        return adminItems
      default:
        return sharedItems
    }
  }

  const navigation = getNavigation()

  if (loading) {
    return (
      <div className={cn("space-y-4 py-4 animate-pulse", className)}>
        <div className="px-3 py-2">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link href="/dashboard" className="flex items-center mb-6">
            <h2 className="text-xl font-semibold">Retail Bandhu</h2>
          </Link>
          <div className="space-y-1">
            {navigation.map((item) => {
              // If the item has children, render as a collapsible
              if (item.children) {
                const isActive = item.children.some((child) => pathname === child.href)
                const isOpen = openGroups[item.name] || isActive

                return (
                  <Collapsible
                    key={item.name}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(item.name)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-3 text-left font-medium",
                          isActive ? "bg-secondary" : "hover:bg-secondary/50",
                        )}
                      >
                        <span className="flex items-center">
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          {item.name}
                        </span>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-1">
                      {item.children.map((child) => (
                        <TooltipProvider key={child.name}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={child.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start text-left font-normal mb-1 pl-2",
                                    pathname === child.href ? "bg-secondary font-medium" : "hover:bg-secondary/50",
                                  )}
                                >
                                  {child.icon && <child.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                                  {child.name}
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{child.name}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              // Otherwise render as a regular link
              return (
                <TooltipProvider key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start px-3 text-left font-medium",
                            pathname === item.href ? "bg-secondary" : "hover:bg-secondary/50",
                          )}
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>

        {/* Help and resources section */}
        <div className="px-3 pt-4">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground px-3 mb-2">Resources</h4>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/resources/documentation">
                <HelpCircle className="mr-2 h-4 w-4" />
                Documentation
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="https://retailbandhu.com/support" target="_blank" rel="noreferrer noopener">
                <ExternalLink className="mr-2 h-4 w-4" />
                Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const DashboardSidebar = Sidebar
