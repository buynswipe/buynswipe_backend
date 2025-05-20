"use client"

import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/delivery-partner/sidebar"
import { DeliveryPartnerHeader } from "@/components/delivery-partner/header"
import { MobileNavigation } from "@/components/mobile-navigation"

export default async function DeliveryPartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Redirect non-delivery partners to their appropriate dashboard
  if (profile?.role !== "delivery_partner") {
    if (profile?.role === "retailer" || profile?.role === "admin") {
      redirect("/dashboard/main")
    } else if (profile?.role === "wholesaler") {
      redirect("/wholesaler-dashboard")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <>
      {/* Hide site header and footer on delivery partner pages */}
      <style jsx global>{`
        header.site-header, footer.site-footer {
          display: none !important;
        }
      `}</style>

      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar className="hidden border-r md:block" />
        <div className="flex flex-col">
          <DeliveryPartnerHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
          <MobileNavigation />
        </div>
      </div>
    </>
  )
}
