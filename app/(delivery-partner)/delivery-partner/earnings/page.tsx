import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EarningsPage() {
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

  // Get earnings
  const { data: earningsData, error: earningsError } = await supabase
    .from("delivery_partner_earnings")
    .select("*")
    .eq("delivery_partner_id", partnerId)
    .order("created_at", { ascending: false })

  if (earningsError) {
    console.error("Error fetching earnings:", earningsError)
  }

  // Create sample data if no real data exists
  const earnings = earningsData || []
  const useSampleData = earnings.length === 0

  const sampleEarnings = [
    {
      id: "earn-1",
      delivery_partner_id: partnerId,
      order_id: "2abb2968-29ab-46d7-bfb1-a47640e5027f",
      amount: 60.0,
      status: "paid",
      created_at: new Date().toISOString(),
      description: "Delivery commission for order #2abb2968",
    },
    {
      id: "earn-2",
      delivery_partner_id: partnerId,
      order_id: "cb40debd-9c0f-434d-a401-8b8915d8e4ea",
      amount: 120.0,
      status: "paid",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      description: "Delivery commission for order #cb40debd",
    },
    {
      id: "earn-3",
      delivery_partner_id: partnerId,
      order_id: "3cdd3069-3a9c-47d8-bfc2-b58640e6028g",
      amount: 85.5,
      status: "paid",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      description: "Delivery commission for order #3cdd3069",
    },
  ]

  const displayEarnings = useSampleData ? sampleEarnings : earnings
  const totalEarnings = displayEarnings.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Earnings</h1>
        <p className="text-muted-foreground">Track your delivery earnings and payment history.</p>
      </div>

      {useSampleData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            <strong>Development Mode:</strong> Showing sample data because no real earnings are available.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">₹{totalEarnings.toFixed(2)}</div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mt-6">Earnings History</h2>
      <div className="space-y-4">
        {displayEarnings.map((earning) => (
          <Card key={earning.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{earning.description}</p>
                  <p className="text-sm text-muted-foreground">{new Date(earning.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-xl font-bold">₹{earning.amount.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
