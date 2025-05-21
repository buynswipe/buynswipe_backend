"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Menu, Search, User, LogOut, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/global-search"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function DashboardHeader() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userInitial, setUserInitial] = useState("")
  const [userRole, setUserRole] = useState("")
  const [notificationCount, setNotificationCount] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, business_name, role")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          const name = profile.full_name || profile.business_name || session.user.email
          setUserName(name)
          setUserRole(profile.role || "user")

          // Get initial for avatar
          const nameParts = name.split(" ")
          if (nameParts.length > 1) {
            setUserInitial(`${nameParts[0][0]}${nameParts[1][0]}`)
          } else if (name) {
            setUserInitial(name[0])
          } else {
            setUserInitial("U")
          }
        }
      }
    }

    getUserProfile()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname || ""
    const parts = path.split("/").filter(Boolean)

    if (parts.length === 0) return "Dashboard"

    // Convert kebab-case to Title Case
    const lastPart = parts[parts.length - 1]
    return lastPart
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 header-mobile">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[240px] pr-0 sidebar-mobile">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsSearchOpen(true)}>
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        <NotificationBell />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary">{userInitial}</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  )
}
