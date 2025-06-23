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

    const { data: categories, error } = await supabase
      .from("product_categories")
      .select("*")
      .eq("retailer_id", session.user.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 })
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

    const { name, description, color, icon, parentId } = await request.json()

    const { data: category, error } = await supabase
      .from("product_categories")
      .insert({
        name,
        description,
        color: color || "#3B82F6",
        icon: icon || "package",
        parent_id: parentId,
        retailer_id: session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ category })
  } catch (error: any) {
    console.error("Category creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 })
  }
}
