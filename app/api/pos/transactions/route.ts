import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "retailer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const {
      session_id,
      items,
      customer_name,
      customer_phone,
      payment_method,
      cash_received,
      discount_amount = 0,
      tax_amount = 0,
      notes,
    } = await request.json()

    if (!session_id || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.line_total, 0)
    const total_amount = subtotal + tax_amount - discount_amount
    const change_given = payment_method === "cash" ? (cash_received || 0) - total_amount : 0

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("pos_transactions")
      .insert({
        session_id,
        retailer_id: session.user.id,
        customer_name,
        customer_phone,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        payment_method,
        cash_received,
        change_given,
        notes,
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // Create transaction items
    const transactionItems = items.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      barcode: item.barcode,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent || 0,
      discount_amount: item.discount_amount || 0,
      line_total: item.line_total,
    }))

    const { error: itemsError } = await supabase.from("pos_transaction_items").insert(transactionItems)

    if (itemsError) {
      // Rollback transaction
      await supabase.from("pos_transactions").delete().eq("id", transaction.id)
      return NextResponse.json({ error: "Failed to create transaction items" }, { status: 500 })
    }

    // Update product stock quantities
    for (const item of items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single()

        if (product) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity)
          await supabase.from("products").update({ stock_quantity: newStock }).eq("id", item.product_id)
        }
      }
    }

    // Update session totals
    await supabase.rpc("update_pos_session_totals", {
      p_session_id: session_id,
      p_transaction_amount: total_amount,
    })

    return NextResponse.json({
      success: true,
      transaction: {
        ...transaction,
        items: transactionItems,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("session_id")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    let query = supabase
      .from("pos_transactions")
      .select(`
        *,
        pos_transaction_items(*)
      `)
      .eq("retailer_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (sessionId) {
      query = query.eq("session_id", sessionId)
    }

    const { data: transactions, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ success: true, transactions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
