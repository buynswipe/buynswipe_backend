"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Bell, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DeliverySidebar } from "./delivery-sidebar"

export function DeliveryHeader() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    async function getUserProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, business_name")
          .eq("id", session.user.id)
          .single()

        if (profile) {
          setUserName(profile.full_name || profile.business_name || "Delivery Partner")
        }
      }
    }

    getUserProfile()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <DeliverySidebar />
            </SheetContent>
          </Sheet>

          <Link href="/delivery" className="flex items-center gap-2">
            <span className="font-bold">Retail Bandhu</span>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Delivery</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium">Welcome, {userName}</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
