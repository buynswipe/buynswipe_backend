"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Home,
  ShoppingCart,
  Package,
  Bell,
  User,
  CreditCard,
  AlertTriangle,
  Truck,
  LayoutDashboard,
  Store,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const [alerts, setAlerts] = useState({ notifications: 0, orders: 0, inventory: 0 })

  useEffect(() => {
    const getUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (data) {
          setRole(data.role)
        }
      }
    }

    // Get alert counts (notifications, orders, inventory alerts)
    const getAlertCounts = async () => {
      // This would normally fetch from your API
      // For now we'll set dummy values based on role
      if (role === "admin") {
        setAlerts({ notifications: 5, orders: 3, inventory: 7 })
      } else if (role === "wholesaler") {
        setAlerts({ notifications: 3, orders: 2, inventory: 4 })
      } else {
        setAlerts({ notifications: 2, orders: 1, inventory: 0 })
      }
    }

    getUserRole()
    const interval = setInterval(getAlertCounts, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [supabase, role])

  // Get navigation items based on user role
  const getNavItems = () => {
    const dashboardPath = role === "wholesaler" ? "/wholesaler-dashboard" : "/dashboard"

    if (role === "admin") {
      return [
        { href: dashboardPath, label: "Dashboard", icon: LayoutDashboard },
        { href: "/orders", label: "Orders", icon: ShoppingCart, badge: alerts.orders > 0 ? alerts.orders : undefined },
        { href: "/manage-products", label: "Products", icon: Package },
        { href: "/users", label: "Users", icon: User },
        {
          href: "/notifications",
          label: "Alerts",
          icon: Bell,
          badge: alerts.notifications > 0 ? alerts.notifications : undefined,
        },
      ]
    } else if (role === "wholesaler") {
      return [
        { href: dashboardPath, label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/order-management",
          label: "Orders",
          icon: ShoppingCart,
          badge: alerts.orders > 0 ? alerts.orders : undefined,
        },
        { href: "/manage-products", label: "Products", icon: Package },
        {
          href: "/inventory-alerts",
          label: "Alerts",
          icon: AlertTriangle,
          badge: alerts.inventory > 0 ? alerts.inventory : undefined,
        },
        { href: "/profile", label: "Profile", icon: User },
      ]
    } else if (role === "retailer") {
      return [
        { href: dashboardPath, label: "Dashboard", icon: LayoutDashboard },
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/wholesalers", label: "Wholesalers", icon: Store },
        { href: "/manage-products", label: "Products", icon: Package },
        { href: "/profile", label: "Profile", icon: User },
      ]
    } else if (role === "delivery_partner") {
      return [
        { href: "/delivery-partner/dashboard", label: "Dashboard", icon: Home },
        { href: "/delivery-partner/my-deliveries", label: "Deliveries", icon: Truck },
        { href: "/delivery-partner/earnings", label: "Earnings", icon: CreditCard },
        { href: "/delivery-partner/profile", label: "Profile", icon: User },
        {
          href: "/delivery-partner/notifications",
          label: "Alerts",
          icon: Bell,
          badge: alerts.notifications > 0 ? alerts.notifications : undefined,
        },
      ]
    }

    // Default fallback
    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/profile", label: "Profile", icon: User },
    ]
  }

  const navItems = getNavItems()

  return (
    <motion.div
      className="fixed bottom-0 left-0 z-50 w-full bg-white dark:bg-gray-950 border-t shadow-lg md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-col items-center justify-center relative",
              pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-transform", pathname === item.href && "scale-110")} />
            <span className="text-xs mt-1">{item.label}</span>

            {item.badge && (
              <span className="absolute top-1 right-1/4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
