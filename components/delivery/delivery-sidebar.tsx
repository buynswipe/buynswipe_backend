"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, CheckCircle, Clock, DollarSign, MessageSquare, User } from "lucide-react"

const deliveryNavItems = [
  {
    title: "Dashboard",
    href: "/delivery",
    icon: LayoutDashboard,
  },
  {
    title: "Active Deliveries",
    href: "/delivery/my-deliveries",
    icon: Package,
  },
  {
    title: "Completed Deliveries",
    href: "/delivery/completed",
    icon: CheckCircle,
  },
  {
    title: "Pending Deliveries",
    href: "/delivery/pending",
    icon: Clock,
  },
  {
    title: "Earnings",
    href: "/delivery/earnings",
    icon: DollarSign,
  },
  {
    title: "Messages",
    href: "/delivery/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/delivery/profile",
    icon: User,
  },
]

export function DeliverySidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12">
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
