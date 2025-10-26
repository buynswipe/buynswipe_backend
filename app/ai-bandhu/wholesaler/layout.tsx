import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function WholesalerAIBandhuLayout({
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

  // Only wholesalers can access this dashboard
  if (profile?.role !== "wholesaler") {
    redirect("/ai-bandhu")
  }

  return <>{children}</>
}
