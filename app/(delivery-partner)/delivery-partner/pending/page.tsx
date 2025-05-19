import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Clock } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PendingDeliveriesPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get delivery partner info
  const { data: partner, error: partnerError } = await supabase
    .from("delivery_partners")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (partnerError && !partnerError.message.includes("No rows found")) {
    console.error("Error fetching delivery partner:", partnerError)
  }

  // If no partner found, create sample data for development
  const partnerId = partner?.id || "dev-partner-id"

  // Get pending deliveries
  const { data: pendingData, error: pendingError } = await supabase
    .from("orders")
    .select(`
      *,
      retailer:retailer_id(business_name, address, city, pincode, phone),
      wholesaler:wholesaler_id(business_name)
    `)
    .eq("delivery_partner_id", partnerId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })

  if (pendingError) {
    console.error("Error fetching pending deliveries:", pendingError)
  }

  // Create sample data if no real data exists
  const pendingDeliveries = pendingData || []
  const useSampleData = pendingDeliveries.length === 0

  // We don't have sample pending deliveries in this example
  // but you could add them if needed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pending Deliveries</h1>
        <p className="text-muted-foreground">View deliveries that are waiting to be picked up.</p>
      </div>

      {useSampleData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            <strong>Development Mode:</strong> No sample pending deliveries are available in development mode.
          </p>
        </div>
      )}

      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-medium">No pending deliveries</h2>
        <p className="text-muted-foreground">You don't have any pending deliveries at the moment.</p>
      </div>
    </div>
  )
}
