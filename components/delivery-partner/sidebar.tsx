"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, CheckCircle, Clock, DollarSign, MessageSquare, User } from "lucide-react"

const deliveryNavItems = [
  {
    title: "Dashboard",
    href: "/delivery-partner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Deliveries",
    href: "/delivery-partner/my-deliveries",
    icon: Package,
  },
  {
    title: "Active Deliveries",
    href: "/delivery-partner/active",
    icon: Package,
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
    title: "Earnings",
    href: "/delivery-partner/earnings",
    icon: DollarSign,
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

export function DeliveryPartnerSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Delivery Dashboard</h2>
          <div className="space-y-1">
            {deliveryNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", pathname === item.href ? "bg-muted hover:bg-muted" : "")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
