import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return available payment methods
    const paymentMethods = [
      {
        id: "cash",
        name: "Cash",
        icon: "banknote",
        enabled: true,
        description: "Cash payment",
      },
      {
        id: "card",
        name: "Card",
        icon: "credit-card",
        enabled: true,
        description: "Credit/Debit card payment",
      },
      {
        id: "upi",
        name: "UPI",
        icon: "smartphone",
        enabled: true,
        description: "UPI payment (PhonePe, GPay, etc.)",
      },
      {
        id: "wallet",
        name: "Digital Wallet",
        icon: "wallet",
        enabled: true,
        description: "Digital wallet payment",
      },
      {
        id: "credit",
        name: "Store Credit",
        icon: "gift-card",
        enabled: true,
        description: "Store credit/gift card",
      },
    ]

    return NextResponse.json({
      success: true,
      payment_methods: paymentMethods,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
