"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Home, ShoppingCart, Package, Bell, User, CreditCard, AlertTriangle, Truck, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
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
    const commonItems = [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ]

    if (role === "admin") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/users", label: "Users", icon: User },
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/products", label: "Products", icon: Package },
        { href: "/payments", label: "Payments", icon: CreditCard },
        { href: "/delivery-partners", label: "Delivery Partners", icon: Truck },
        { href: "/inventory-alerts", label: "Inventory Alerts", icon: AlertTriangle },
        ...commonItems,
      ]
    } else if (role === "wholesaler") {
      return [
        { href: "/wholesaler-dashboard", label: "Dashboard", icon: Home },
        { href: "/order-management", label: "Order Management", icon: ShoppingCart },
        { href: "/products", label: "Products", icon: Package },
        { href: "/inventory-alerts", label: "Inventory Alerts", icon: AlertTriangle },
        { href: "/delivery-partners", label: "Delivery Partners", icon: Truck },
        ...commonItems,
      ]
    } else if (role === "retailer") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/orders", label: "Orders", icon: ShoppingCart },
        { href: "/wholesalers", label: "Wholesalers", icon: Package },
        { href: "/payments", label: "Payments", icon: CreditCard },
        ...commonItems,
      ]
    } else if (role === "delivery_partner") {
      return [
        { href: "/delivery-partner/dashboard", label: "Dashboard", icon: Home },
        { href: "/delivery-partner/my-deliveries", label: "My Deliveries", icon: Truck },
        { href: "/delivery-partner/earnings", label: "Earnings", icon: CreditCard },
        ...commonItems,
      ]
    }

    return commonItems
  }

  const navItems = getNavItems()

  const handleNavigation = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5">
        {navItems.slice(0, 4).map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-col items-center justify-center",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center justify-center h-full rounded-none"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <div className="flex-1 overflow-auto py-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left",
                      pathname === item.href ? "bg-muted" : "",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = "/login"
                  }}
                >
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
