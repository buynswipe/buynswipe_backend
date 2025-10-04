import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock categories data
    const mockCategories = [
      {
        id: "cat_1",
        name: "Groceries",
        description: "Essential food items and household goods",
        color: "#22c55e",
        icon: "package",
        isActive: true,
        sortOrder: 1,
        productCount: 45,
      },
      {
        id: "cat_2",
        name: "Beverages",
        description: "Drinks and refreshments",
        color: "#3b82f6",
        icon: "coffee",
        isActive: true,
        sortOrder: 2,
        productCount: 12,
      },
      {
        id: "cat_3",
        name: "Snacks",
        description: "Quick bites and treats",
        color: "#f59e0b",
        icon: "star",
        isActive: true,
        sortOrder: 3,
        productCount: 28,
      },
      {
        id: "cat_4",
        name: "Personal Care",
        description: "Health and hygiene products",
        color: "#ec4899",
        icon: "heart",
        isActive: true,
        sortOrder: 4,
        productCount: 15,
      },
      {
        id: "cat_5",
        name: "Household",
        description: "Cleaning and maintenance items",
        color: "#8b5cf6",
        icon: "grid",
        isActive: true,
        sortOrder: 5,
        productCount: 20,
      },
    ]

    return NextResponse.json({
      categories: mockCategories,
      total: mockCategories.length,
    })
  } catch (error: any) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categoryData = await request.json()
    const { name, description, color, icon, parentId, isActive } = categoryData

    if (!name || !color || !icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newCategory = {
      id: `cat_${Date.now()}`,
      name,
      description: description || "",
      color,
      icon,
      parentId: parentId || null,
      isActive: isActive !== false,
      sortOrder: Date.now(),
      productCount: 0,
      createdAt: new Date().toISOString(),
    }

    // In a real implementation, save to database
    console.log("Category created:", newCategory)

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: "Category created successfully",
    })
  } catch (error: any) {
    console.error("Category creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
