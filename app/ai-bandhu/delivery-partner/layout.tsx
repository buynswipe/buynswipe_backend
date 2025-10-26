import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DeliveryPartnerAIBandhuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Only delivery partners can access this dashboard
  if (profile?.role !== "delivery_partner") {
    redirect("/ai-bandhu")
  }

  return <>{children}</>
}
