import { LayoutDashboard, Package, Settings, ShoppingBag, Users } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { SidebarNavItem } from "@/components/sidebar-nav"

interface SidebarProps {
  items: SidebarNavItem[]
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-primary/10 py-4">
      <MainNav className="px-6" />
      <nav className="flex-1 space-y-2 px-6 py-4">
        {items.map((item) => (
          <SidebarNavItem key={item.href} title={item.title} href={item.href} icon={item.icon} roles={item.roles} />
        ))}
      </nav>
    </div>
  )
}

const sidebarConfig = {
  items: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Products",
      href: "/manage-products",
      icon: <Package className="h-5 w-5" />,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Orders",
      href: "/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      roles: ["admin", "retailer", "wholesaler"],
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
  ],
}

export { sidebarConfig }
