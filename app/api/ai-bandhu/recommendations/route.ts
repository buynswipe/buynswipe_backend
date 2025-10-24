import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import {
  getRetailerRecommendations,
  getWholesalerRecommendations,
  getDeliveryPartnerRecommendations,
} from "@/lib/recommendation-engine"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    let recommendations = []

    if (role === "retailer") {
      recommendations = await getRetailerRecommendations(session.user.id)
    } else if (role === "wholesaler") {
      recommendations = await getWholesalerRecommendations(session.user.id)
    } else if (role === "delivery_partner") {
      recommendations = await getDeliveryPartnerRecommendations(session.user.id)
    }

    return Response.json({ recommendations })
  } catch (error) {
    console.error("Recommendations error:", error)
    return Response.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}
