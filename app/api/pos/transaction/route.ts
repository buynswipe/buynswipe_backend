import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, payment_method, total_amount, tax_amount, discount_amount, customer_info, pos_session_id } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    if (!payment_method || !total_amount) {
      return NextResponse.json({ error: "Payment method and total amount are required" }, { status: 400 })
    }

    // Start transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("pos_transactions")
      .insert({
        user_id: session.user.id,
        pos_session_id,
        payment_method,
        total_amount: Number.parseFloat(total_amount),
        tax_amount: Number.parseFloat(tax_amount) || 0,
        discount_amount: Number.parseFloat(discount_amount) || 0,
        customer_info,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // Add transaction items
    const transactionItems = items.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      quantity: Number.parseInt(item.quantity),
      unit_price: Number.parseFloat(item.unit_price),
      total_price: Number.parseFloat(item.total_price),
      discount_amount: Number.parseFloat(item.discount_amount) || 0,
    }))

    const { error: itemsError } = await supabase.from("pos_transaction_items").insert(transactionItems)

    if (itemsError) {
      // Rollback transaction
      await supabase.from("pos_transactions").delete().eq("id", transaction.id)
      return NextResponse.json({ error: "Failed to add transaction items" }, { status: 500 })
    }

    // Update product stock quantities
    for (const item of items) {
      const { error: stockError } = await supabase.rpc("update_product_stock", {
        product_id: item.product_id,
        quantity_sold: Number.parseInt(item.quantity),
      })

      if (stockError) {
        console.error("Failed to update stock for product:", item.product_id, stockError)
        // Continue with other items even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: "Transaction completed successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: transactions,
      error,
      count,
    } = await supabase
      .from("pos_transactions")
      .select(
        `
        *,
        pos_transaction_items (
          *,
          products (
            name,
            sku
          )
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
