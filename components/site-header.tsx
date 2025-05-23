"use client"

import type * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { isPublicRoute } from "@/lib/public-routes"
import { ThemeToggle } from "./theme-toggle"

export function SiteHeader({ className }: React.HTMLAttributes<HTMLElement>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkLoginStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsLoggedIn(true)
        // Get user role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

        if (profile) {
          setUserRole(profile.role)
        }
      } else {
        setIsLoggedIn(false)
      }
      setIsLoading(false)
    }

    checkLoginStatus()
  }, [supabase, pathname])

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (userRole === "delivery_partner") {
      return "/delivery-partner/dashboard"
    }
    return "/dashboard"
  }

  const isPublic = isPublicRoute(pathname || "")

  if (!isPublic && !isLoading && isLoggedIn) {
    return null // Don't render header for authenticated non-public pages
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 site-header",
        className,
      )}
    >
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
          ) : isLoggedIn ? (
            <Button asChild>
              <Link href={getDashboardLink()}>Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-1">
              <Link href="/login">
                <Button variant="ghost" className="text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
