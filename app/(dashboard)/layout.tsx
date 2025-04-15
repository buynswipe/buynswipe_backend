import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Redirect delivery partners to their dashboard
  if (profile?.role === "delivery_partner") {
    redirect("/delivery-partner/dashboard")
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar className="hidden border-r md:block" />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <RoleGuard allowedRoles={["admin", "retailer", "wholesaler"]}>{children}</RoleGuard>
        </main>
        <MobileNavigation />
      </div>
    </div>
  )
}
