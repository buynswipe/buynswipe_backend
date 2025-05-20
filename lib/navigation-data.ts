import {
  BarChart,
  Bell,
  CreditCard,
  Home,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from "lucide-react"
import type { SidebarNavItem } from "@/components/navigation/sidebar-nav"

export function getNavigationItems(role: string): SidebarNavItem[] {
  // Common navigation items for all roles
  const commonItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard/main",
      icon: Home,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Orders",
      href: "/orders",
      icon: ShoppingBag,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Profile",
      href: "/profile",
      icon: Settings,
      roles: ["admin", "retailer", "wholesaler"],
    },
  ]

  // Admin-specific navigation items
  const adminItems: SidebarNavItem[] = [
    {
      title: "Users",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Wholesalers",
      href: "/wholesalers",
      icon: Store,
      roles: ["admin"],
    },
    {
      title: "Delivery Partners",
      href: "/delivery-partners",
      icon: Truck,
      roles: ["admin"],
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: CreditCard,
      roles: ["admin"],
    },
    {
      title: "Inventory Alerts",
      href: "/inventory-alerts",
      icon: Bell,
      roles: ["admin"],
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
      roles: ["admin"],
    },
  ]

  // Retailer-specific navigation items
  const retailerItems: SidebarNavItem[] = [
    {
      title: "Products",
      href: "/manage-products",
      icon: Package,
      roles: ["retailer"],
    },
    {
      title: "Wholesalers",
      href: "/wholesalers",
      icon: Store,
      roles: ["retailer"],
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      roles: ["retailer"],
    },
  ]

  // Wholesaler-specific navigation items
  const wholesalerItems: SidebarNavItem[] = [
    {
      title: "Products",
      href: "/manage-products",
      icon: Package,
      roles: ["wholesaler"],
    },
    {
      title: "Order Management",
      href: "/order-management",
      icon: ShoppingCart,
      roles: ["wholesaler"],
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      roles: ["wholesaler"],
    },
  ]

  // Filter items based on user role
  let items: SidebarNavItem[] = [...commonItems]

  if (role === "admin") {
    items = [...items, ...adminItems]
  } else if (role === "retailer") {
    items = [...items, ...retailerItems]
  } else if (role === "wholesaler") {
    items = [...items, ...wholesalerItems]
  }

  // Filter out items that don't match the user's role
  return items.filter((item) => !item.roles || item.roles.includes(role))
}
