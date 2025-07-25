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

    // Get distinct categories from products
    const { data: categories, error } = await supabase
      .from("products")
      .select("category")
      .eq("status", "active")
      .not("category", "is", null)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    // Get unique categories with counts
    const categoryMap = new Map<string, number>()
    categories?.forEach((item) => {
      const count = categoryMap.get(item.category) || 0
      categoryMap.set(item.category, count + 1)
    })

    const categoryList = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }))

    return NextResponse.json({
      success: true,
      categories: categoryList,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
