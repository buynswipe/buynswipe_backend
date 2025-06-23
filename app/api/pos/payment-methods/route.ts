import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: methods, error } = await supabase
      .from("pos_payment_methods")
      .select("*")
      .eq("retailer_id", session.user.id)
      .eq("is_active", true)
      .order("name")

    if (error) throw error

    return NextResponse.json({ methods })
  } catch (error: any) {
    console.error("Payment methods fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payment methods" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, type, processingFeePercentage, processingFeeFixed } = await request.json()

    const { data: method, error } = await supabase
      .from("pos_payment_methods")
      .insert({
        name,
        type,
        processing_fee_percentage: processingFeePercentage || 0,
        processing_fee_fixed: processingFeeFixed || 0,
        retailer_id: session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ method })
  } catch (error: any) {
    console.error("Payment method creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment method" }, { status: 500 })
  }
}
