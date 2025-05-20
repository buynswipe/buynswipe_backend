"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  path: string
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

export function SidebarNavItem({
  icon: Icon,
  title,
  path,
  isActive,
  isCollapsed = false,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground w-full text-left",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
        isCollapsed && "justify-center",
      )}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed && <span>{title}</span>}
    </button>
  )
}

// Re-export the SidebarNav component from the navigation folder for backward compatibility
export { SidebarNav, type } from "@/components/navigation/sidebar-nav"
