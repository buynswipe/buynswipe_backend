import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactionData = await request.json()
    const {
      sessionId,
      customerId,
      discountId,
      items,
      subtotal,
      tax,
      total,
      discountAmount,
      paymentData,
      loyaltyPointsEarned,
    } = transactionData

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create transaction record
    const transaction = {
      id: transactionId,
      sessionId,
      customerId,
      discountId,
      items,
      subtotal,
      tax,
      total,
      discountAmount: discountAmount || 0,
      paymentMethod: paymentData.method || "cash",
      paymentAmount: paymentData.amount || total,
      change: Math.max(0, (paymentData.amount || total) - total),
      loyaltyPointsEarned: loyaltyPointsEarned || 0,
      cashierId: session.user.id,
      timestamp: new Date().toISOString(),
      status: "completed",
      receiptNumber: `RCP_${Date.now()}`,
    }

    // In a real implementation, you would:
    // 1. Save transaction to database
    // 2. Update inventory
    // 3. Update customer loyalty points
    // 4. Generate receipt
    // 5. Send notifications

    console.log("Transaction processed:", transaction)

    return NextResponse.json({
      success: true,
      transaction,
      message: "Transaction completed successfully",
    })
  } catch (error: any) {
    console.error("Transaction processing error:", error)
    return NextResponse.json(
      {
        error: "Transaction failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Mock transaction history
    const mockTransactions = [
      {
        id: "TXN_001",
        timestamp: new Date().toISOString(),
        total: 150.0,
        items: 3,
        paymentMethod: "cash",
        customer: "John Doe",
      },
      {
        id: "TXN_002",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        total: 75.5,
        items: 2,
        paymentMethod: "card",
        customer: "Guest",
      },
    ]

    return NextResponse.json({
      transactions: mockTransactions.slice(0, limit),
      total: mockTransactions.length,
    })
  } catch (error: any) {
    console.error("Transaction fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
