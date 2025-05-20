"use client"

import type React from "react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useNavigation } from "@/contexts/navigation-context"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
}

export function SidebarNav({ className, isCollapsed = false, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { navigationItems } = useNavigation()
  const [open, setOpen] = useState(false)

  const handleNavigation = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <MobileNavItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  onSelect={(path) => handleNavigation(path)}
                />
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className={cn("pb-12", className)} {...props}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  onSelect={(path) => handleNavigation(path)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface NavItemProps {
  item: {
    id: string
    title: string
    icon: React.ComponentType
    path: string
    description?: string
    children?: {
      id: string
      title: string
      icon: React.ComponentType
      path: string
      description?: string
    }[]
  }
  pathname: string
  isCollapsed?: boolean
  onSelect: (path: string) => void
}

// Export NavItem as SidebarNavItem for compatibility
export function NavItem({ item, pathname, isCollapsed, onSelect }: NavItemProps) {
  const [open, setOpen] = useState(false)
  const Icon = item.icon
  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`)

  if (item.children) {
    return (
      <div className={cn("relative", isActive && "bg-muted")}>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center rounded-md border border-transparent p-2",
            isActive && "text-foreground",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
        {open && !isCollapsed && (
          <div className="mt-1 space-y-1 px-2">
            {item.children.map((child) => (
              <ChildNavItem key={child.id} item={child} pathname={pathname} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelect(item.path)}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground w-full text-left",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
        isCollapsed && "justify-center",
      )}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed && <span>{item.title}</span>}
      {!isCollapsed && item.description && <span className="sr-only">{item.description}</span>}
    </button>
  )
}

// Also export NavItem as SidebarNavItem for compatibility
export const SidebarNavItem = NavItem

function ChildNavItem({
  item,
  pathname,
  onSelect,
}: {
  item: NavItemProps["item"]
  pathname: string
  onSelect: (path: string) => void
}) {
  const Icon = item.icon
  const isActive = pathname === item.path

  return (
    <button
      onClick={() => onSelect(item.path)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-left",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </button>
  )
}

function MobileNavItem({ item, pathname, onSelect }: NavItemProps & { onSelect: (path: string) => void }) {
  const [open, setOpen] = useState(false)
  const Icon = item.icon
  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`)

  if (item.children) {
    return (
      <div className={cn("relative", isActive && "bg-muted")}>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-transparent p-2",
            isActive && "text-foreground",
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div className="mt-1 space-y-1 px-2">
            {item.children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelect(child.path)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground w-full text-left",
                  pathname === child.path ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <child.icon className="h-4 w-4" />
                <span>{child.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelect(item.path)}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground w-full text-left",
        isActive ? "bg-accent text-accent-foreground" : "transparent",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </button>
  )
}
