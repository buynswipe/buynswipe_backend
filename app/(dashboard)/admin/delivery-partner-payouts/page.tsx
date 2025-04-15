import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PayoutManagement } from "@/components/admin/payout-management"

export const dynamic = "force-dynamic"

export default async function DeliveryPartnerPayoutsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery Partner Payouts</h1>
        <p className="text-muted-foreground">Manage and process payments to delivery partners</p>
      </div>

      <PayoutManagement />
    </div>
  )
}
