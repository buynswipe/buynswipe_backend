import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AnalyticsDashboard } from "./analytics-dashboard"

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user.id).single()

  // Get analytics data
  const { data: salesData } = await supabase
    .from("orders")
    .select("created_at, total_amount, status")
    .order("created_at", { ascending: false })
    .limit(100)

  // Get product performance data
  const { data: productData } = await supabase
    .from("products")
    .select("id, name, sku, price, inventory_count")
    .order("inventory_count", { ascending: true })
    .limit(10)

  // Get customer metrics
  const { data: customerData } = await supabase
    .from("profiles")
    .select("id, created_at, role")
    .eq("role", "retailer")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <AnalyticsDashboard salesData={salesData || []} productData={productData || []} customerData={customerData || []} />
  )
}
