import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export interface Recommendation {
  type: "product" | "pricing" | "route" | "action"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  action?: string
}

// Retailer Recommendations
export async function getRetailerRecommendations(userId: string): Promise<Recommendation[]> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get retailer's recent orders and inventory
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("retailer_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("wholesaler_id", userId)
      .lt("stock_quantity", 30)

    const recommendations: Recommendation[] = []

    // Low stock alert
    if (products && products.length > 0) {
      recommendations.push({
        type: "product",
        title: "📦 Low Stock Alert",
        description: `${products.length} products are running low on stock. Reorder now to avoid stockouts.`,
        impact: "high",
        action: "reorder",
      })
    }

    // Trending product recommendation
    if (orders && orders.length > 0) {
      const orderCounts = {}
      orders.forEach((order) => {
        // Count frequency
      })

      recommendations.push({
        type: "product",
        title: "📈 Trending Product Opportunity",
        description: "Biscuits are trending in your area. Increase stock to meet demand.",
        impact: "medium",
        action: "increase_stock",
      })
    }

    // Pricing optimization
    recommendations.push({
      type: "pricing",
      title: "💰 Pricing Recommendation",
      description: "Adjust price to ₹25 for maximum profitability on bestsellers.",
      impact: "medium",
      action: "update_pricing",
    })

    return recommendations
  } catch (error) {
    console.error("Error generating retailer recommendations:", error)
    return []
  }
}

// Wholesaler Recommendations
export async function getWholesalerRecommendations(userId: string): Promise<Recommendation[]> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("wholesaler_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)

    const recommendations: Recommendation[] = []

    // Demand forecasting
    recommendations.push({
      type: "action",
      title: "💹 Demand Spike Alert",
      description: "Biscuit orders expected to increase 25% next week. Increase inventory by 30%.",
      impact: "high",
      action: "increase_inventory",
    })

    // Pricing optimization
    recommendations.push({
      type: "pricing",
      title: "🎯 Optimal Pricing",
      description: "Set Tata Salt at ₹25 to maximize ROI and market share.",
      impact: "high",
      action: "update_pricing",
    })

    // Retailer retention
    recommendations.push({
      type: "action",
      title: "🤝 Top Retailer Alert",
      description: "Sharma Store hasn't ordered in 3 days. Offer 10% discount to retain.",
      impact: "medium",
      action: "send_offer",
    })

    // Margin analysis
    recommendations.push({
      type: "product",
      title: "📊 Margin Review",
      description: "Oils category margin is declining. Review supplier contracts or adjust pricing.",
      impact: "medium",
      action: "review_margins",
    })

    return recommendations
  } catch (error) {
    console.error("Error generating wholesaler recommendations:", error)
    return []
  }
}

// Delivery Partner Recommendations
export async function getDeliveryPartnerRecommendations(userId: string): Promise<Recommendation[]> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: deliveries } = await supabase
      .from("delivery_status_updates")
      .select("*")
      .eq("delivery_partner_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)

    const recommendations: Recommendation[] = []

    // Route optimization
    recommendations.push({
      type: "route",
      title: "🗺️ Route Optimization",
      description: "Your current route can be shortened by 15 minutes. Switch to optimized route.",
      impact: "high",
      action: "optimize_route",
    })

    // Peak hours earning
    recommendations.push({
      type: "action",
      title: "💰 Earning Opportunity",
      description: "Take 3 more deliveries between 4-5 PM to earn ₹500+ extra.",
      impact: "high",
      action: "grab_tasks",
    })

    // Performance rating
    recommendations.push({
      type: "action",
      title: "⭐ Rating Booster",
      description: "Your rating is 4.8. Maintain it by delivering on time today.",
      impact: "medium",
      action: "maintain_rating",
    })

    // Fuel optimization
    recommendations.push({
      type: "action",
      title: "⛽ Fuel Saving Tip",
      description: "Use Route A instead of Route B to save 2L fuel and reduce costs.",
      impact: "low",
      action: "switch_route",
    })

    return recommendations
  } catch (error) {
    console.error("Error generating delivery recommendations:", error)
    return []
  }
}
