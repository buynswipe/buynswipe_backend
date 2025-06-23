import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, items, subtotal, tax, total, paymentMethod, amountPaid, change } = await request.json()

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("pos_transactions")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        items: JSON.stringify(items),
        subtotal,
        tax,
        total,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        change_amount: change,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 })
    }

    // Update inventory for each item
    for (const item of items) {
      await supabase.rpc("update_product_stock", {
        product_id: item.id,
        quantity_sold: item.quantity,
      })
    }

    // Update session totals
    await supabase
      .from("pos_sessions")
      .update({
        total_sales: supabase.raw("total_sales + ?", [total]),
        total_transactions: supabase.raw("total_transactions + 1"),
      })
      .eq("id", sessionId)

    return NextResponse.json({
      ...transaction,
      items: JSON.parse(transaction.items),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    let query = supabase
      .from("pos_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (sessionId) {
      query = query.eq("session_id", sessionId)
    }

    const { data: transactions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Parse items JSON for each transaction
    const parsedTransactions = transactions.map((transaction) => ({
      ...transaction,
      items: JSON.parse(transaction.items),
    }))

    return NextResponse.json(parsedTransactions)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
