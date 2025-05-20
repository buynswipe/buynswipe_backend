"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Truck, CheckCircle, Clock, CreditCard, User, MessageSquare, BellRing } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const deliveryNavItems = [
  {
    title: "Dashboard",
    href: "/delivery-partner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Deliveries",
    href: "/delivery-partner/my-deliveries",
    icon: Truck,
  },
  {
    title: "Active Deliveries",
    href: "/delivery-partner/active",
    icon: Truck,
  },
  {
    title: "Completed Deliveries",
    href: "/delivery-partner/completed",
    icon: CheckCircle,
  },
  {
    title: "Pending Deliveries",
    href: "/delivery-partner/pending",
    icon: Clock,
  },
  {
    title: "Notifications",
    href: "/delivery-partner/notifications",
    icon: BellRing,
  },
  {
    title: "Earnings",
    href: "/delivery-partner/earnings",
    icon: CreditCard,
  },
  {
    title: "Messages",
    href: "/delivery-partner/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/delivery-partner/profile",
    icon: User,
  },
]

export function DeliveryPartnerSidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Delivery Dashboard</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {deliveryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent" : "transparent",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Export DeliveryPartnerSidebar as Sidebar for backward compatibility
export const Sidebar = DeliveryPartnerSidebar
