import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params
    const body = await request.json()

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
      // Recalculate margin percentage if price or cost_price changed
      margin_percentage:
        body.cost_price && body.price
          ? ((Number.parseFloat(body.price) - Number.parseFloat(body.cost_price)) / Number.parseFloat(body.price)) * 100
          : body.margin_percentage,
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .eq("wholesaler_id", session.user.id) // Ensure user can only update their own products
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("products").delete().eq("id", id).eq("wholesaler_id", session.user.id) // Ensure user can only delete their own products

    if (error) {
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
