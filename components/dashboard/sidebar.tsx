"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getNavigationItems } from "@/lib/navigation-data"
import Link from "next/link"
import { Store, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [navItems, setNavItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openSections, setOpenSections] = useState<string[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUserRole() {
      try {
        setLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setLoading(false)
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (profile) {
          setUserRole(profile.role)

          if (profile.role === "delivery_partner") {
            window.location.href = "/delivery-partner/dashboard"
            return
          }

          const items = getNavigationItems(profile.role)
          setNavItems(items)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching user role:", error)
        setLoading(false)
      }
    }

    getUserRole()
  }, [supabase])

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  if (userRole === "delivery_partner") {
    return null
  }

  if (loading) {
    return (
      <div className={cn("w-64 border-r bg-white dark:bg-gray-950", className)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-64 border-r bg-white dark:bg-gray-950", className)}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">Retail Bandhu</span>
        </Link>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const hasChildren = item.children && item.children.length > 0

              if (hasChildren) {
                const isOpen = openSections.includes(item.title)
                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleSection(item.title)}>
                    <CollapsibleTrigger className="nav-link w-full justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-7 mt-2 space-y-1">
                      {item.children.map((child: any) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn("nav-link text-sm", pathname === child.href && "active")}
                        >
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              return (
                <Link key={item.href} href={item.href} className={cn("nav-link", isActive && "active")}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}

export const DashboardSidebar = Sidebar
