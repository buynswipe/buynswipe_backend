import type { ReactNode } from "react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default async function DeliveryPartnerLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is a delivery partner
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Only delivery partners should access this layout
  if (profile?.role !== "delivery_partner") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
        <Toaster />
      </ThemeProvider>
    </div>
  )
}
