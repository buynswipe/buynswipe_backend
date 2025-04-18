"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Box,
  Building2,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Users,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    role: ["admin", "retailer", "wholesaler", "delivery_partner"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    role: ["admin", "retailer", "wholesaler", "delivery_partner"],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    role: ["admin"],
  },
  {
    title: "Products",
    href: "/products",
    icon: Box,
    role: ["admin", "retailer", "wholesaler"],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    role: ["admin", "retailer"],
  },
  {
    title: "Order Management",
    href: "/order-management",
    icon: Package,
    role: ["admin", "wholesaler"],
  },
  {
    title: "Wholesalers",
    href: "/wholesalers",
    icon: Building2,
    role: ["admin", "retailer"],
  },
  {
    title: "Delivery Partners",
    href: "/delivery-partners",
    icon: Truck,
    role: ["admin", "wholesaler"],
  },
  {
    title: "Delivery Partner Management",
    href: "/delivery-partner-management",
    icon: Truck,
    role: ["admin"],
  },
  {
    title: "Inventory Alerts",
    href: "/inventory-alerts",
    icon: AlertTriangle,
    role: ["admin", "wholesaler"],
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
    role: ["admin", "retailer", "wholesaler"],
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: BarChart3,
    role: ["admin"],
  },
  {
    title: "Chat Support",
    href: "/chat-support",
    icon: MessageSquare,
    role: ["admin", "retailer", "wholesaler"],
  },
  {
    title: "Payment Config",
    href: "/payment-config",
    icon: Settings,
    role: ["admin"],
  },
  {
    title: "System Setup",
    href: "/admin/setup",
    icon: Settings,
    role: ["admin"],
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
    role: ["admin", "retailer", "wholesaler", "delivery_partner"],
  },
]

interface SidebarNavProps {
  userRole: string
}

export function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname()

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => item.role.includes(userRole))

  return (
    <nav className="grid items-start gap-2">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent",
          )}
        >
          <item.icon className="mr-3 h-5 w-5" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}
