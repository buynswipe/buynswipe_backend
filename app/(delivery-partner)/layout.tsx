import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DeliveryPartnerLayoutClient } from "./delivery-partner-layout-client"

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

  return <DeliveryPartnerLayoutClient>{children}</DeliveryPartnerLayoutClient>
}
