"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Home, ShoppingCart, Package, Bell, User, CreditCard, Truck, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClientComponentClient()

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

    getUserRole()
  }, [supabase])

  // Get navigation items based on user role
  const getNavItems = () => {
    if (role === "admin") {
      return [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/analytics", label: "Analytics", icon: BarChart },
        { href: "/products", label: "Products", icon: Package },
        { href: "/profile", label: "Profile", icon: User },
      ]
    } else if (role === "wholesaler") {
      return [
        { href: "/wholesaler-dashboard", label: "Home", icon: Home },
        { href: "/order-management", label: "Orders", icon: ShoppingCart },
        { href: "/analytics", label: "Analytics", icon: BarChart },
        { href: "/products", label: "Products", icon: Package },
        { href: "/profile", label: "Profile", icon: User },
      ]
    } else if (role === "retailer") {
      return [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/wholesalers", label: "Suppliers", icon: Package },
        { href: "/payments", label: "Payments", icon: CreditCard },
        { href: "/profile", label: "Profile", icon: User },
      ]
    } else if (role === "delivery_partner") {
      return [
        { href: "/delivery-partner/dashboard", label: "Home", icon: Home },
        { href: "/delivery-partner/my-deliveries", label: "Deliveries", icon: Truck },
        { href: "/delivery-partner/earnings", label: "Earnings", icon: CreditCard },
        { href: "/delivery-partner/notifications", label: "Alerts", icon: Bell },
        { href: "/delivery-partner/profile", label: "Profile", icon: User },
      ]
    }

    // Default navigation
    return [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/orders", label: "Orders", icon: ShoppingCart },
      { href: "/products", label: "Products", icon: Package },
      { href: "/notifications", label: "Alerts", icon: Bell },
      { href: "/profile", label: "Profile", icon: User },
    ]
  }

  const navItems = getNavItems()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background md:hidden bottom-nav">
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-col items-center justify-center transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
