"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface SidebarNavItem {
  title: string
  href: string
  icon?: LucideIcon
  disabled?: boolean
  external?: boolean
  label?: string
  roles?: string[]
}

interface SidebarNavProps {
  items: SidebarNavItem[]
  className?: string
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => {
        const Icon = item.icon
        return item.href ? (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
              item.disabled && "pointer-events-none opacity-60",
            )}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
            {item.label && (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium leading-none text-primary">
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={item.title}
            className="flex w-full cursor-not-allowed items-center gap-2 rounded-md p-2 text-muted-foreground"
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
            {item.label && (
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium leading-none">
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
