import type React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Store,
  Bell,
  CreditCard,
  Truck,
  BarChart3,
  MessageSquare,
  Settings,
  Database,
  UserPlus,
  CheckCircle,
  Clock,
  User,
  BellRing,
  Boxes,
  ClipboardList,
  AlertTriangle,
  BarChart,
  DollarSign,
  UserCog,
} from "lucide-react"
import type { UserRole } from "@/types/database.types"

export type NavItem = {
  title: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

// Keep the original navigationItems export for backward compatibility
export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "retailer", "wholesaler"],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    roles: ["admin", "retailer"], // Removed wholesaler from Orders
  },
  {
    title: "Order Management",
    href: "/order-management",
    icon: Package,
    roles: ["admin", "wholesaler"], // Only wholesalers and admin have Order Management
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Products",
    href: "/products",
    icon: Store,
    roles: ["admin", "wholesaler"],
  },
  {
    title: "Inventory Alerts",
    href: "/inventory-alerts",
    icon: Bell,
    roles: ["admin", "wholesaler"],
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["admin", "retailer", "wholesaler"],
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Delivery Partners",
    href: "/delivery-partners",
    icon: Truck,
    roles: ["admin", "wholesaler"],
  },
  {
    title: "Delivery Partner Earnings",
    href: "/delivery-partner-earnings",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: BellRing,
    roles: ["admin", "retailer", "wholesaler", "delivery_partner"],
  },
  {
    title: "Chat Support",
    href: "/admin/chat-support",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    title: "Payment Config",
    href: "/admin/payment-config",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "Database Management",
    href: "/admin/database",
    icon: Database,
    roles: ["admin"],
  },
  {
    title: "Create Delivery Partner",
    href: "/admin/create-delivery-partner",
    icon: UserPlus,
    roles: ["admin"],
  },
  {
    title: "Delivery Partner Management",
    href: "/admin/delivery-partner-management",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: ["admin", "retailer", "wholesaler"],
  },
]

export const deliveryPartnerNavItems = [
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
    title: "Profile",
    href: "/delivery-partner/profile",
    icon: User,
  },
]

// Update the getNavigationItems function
export const getNavigationItems = (role: string) => {
  const commonItems = [
    {
      title: "Dashboard",
      href: role === "wholesaler" ? "/wholesaler-dashboard" : "/dashboard/main",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: Settings,
    },
  ]

  const adminItems = [
    ...commonItems,
    {
      title: "Users",
      href: "/users",
      icon: Users,
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "Order Management",
      href: "/order-management",
      icon: ClipboardList,
    },
    {
      title: "Wholesalers",
      href: "/wholesalers",
      icon: Boxes,
    },
    {
      title: "Delivery Partners",
      href: "/delivery-partners",
      icon: Truck,
    },
    {
      title: "Delivery Partner Management",
      href: "/admin/delivery-partner-management",
      icon: UserCog,
    },
    {
      title: "Inventory Alerts",
      href: "/inventory-alerts",
      icon: AlertTriangle,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: CreditCard,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: BarChart,
    },
    {
      title: "Chat Support",
      href: "/admin/chat-support",
      icon: MessageSquare,
    },
    {
      title: "Payment Config",
      href: "/admin/payment-config",
      icon: Settings,
    },
    {
      title: "Create Delivery Partner",
      href: "/admin/create-delivery-partner",
      icon: UserPlus,
    },
    {
      title: "Database",
      href: "/admin/database",
      icon: Database,
    },
  ]

  const retailerItems = [
    ...commonItems,
    {
      title: "Products",
      href: "/retailer/products",
      icon: Package,
    },
    {
      title: "Orders", // Retailers have Orders, not Order Management
      href: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
  ]

  const wholesalerItems = [
    ...commonItems,
    {
      title: "Product Catalog",
      href: "/products",
      icon: Package,
    },
    {
      title: "Order Management", // Wholesalers have Order Management, not Orders
      href: "/order-management",
      icon: ClipboardList,
    },
    {
      title: "Inventory Alerts",
      href: "/inventory-alerts",
      icon: AlertTriangle,
    },
    {
      title: "Payment Tracking",
      href: "/payments",
      icon: CreditCard,
    },
    {
      title: "Delivery Partners",
      href: "/delivery-partners",
      icon: Truck,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
  ]

  const deliveryPartnerItems = [
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
      icon: ShoppingCart,
    },
    {
      title: "Completed Deliveries",
      href: "/delivery-partner/completed",
      icon: ClipboardList,
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
      title: "Profile",
      href: "/delivery-partner/profile",
      icon: User,
    },
  ]

  switch (role) {
    case "admin":
      return adminItems
    case "retailer":
      return retailerItems
    case "wholesaler":
      return wholesalerItems
    case "delivery_partner":
      return deliveryPartnerItems
    default:
      return commonItems
  }
}
