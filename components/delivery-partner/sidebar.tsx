"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  User,
  MessageSquare,
  BellRing,
  Store,
} from "lucide-react"

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
    <div
      className={cn(
        "pb-12 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="space-y-6 py-6">
        <div className="px-6 py-2">
          <Link href="/delivery-partner/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl">Delivery Dashboard</span>
          </Link>

          <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-2">
            <div className="space-y-1 px-2">
              {deliveryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-item", pathname === item.href && "nav-item-active")}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
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
