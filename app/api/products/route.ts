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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const barcode = searchParams.get("barcode")

    // Mock products data for now
    const mockProducts = [
      {
        id: "1",
        name: "Rice 1kg",
        price: 45.0,
        barcode: "8901030895016",
        category: "Groceries",
        stock: 100,
      },
      {
        id: "2",
        name: "Wheat Flour 1kg",
        price: 35.0,
        barcode: "8901030895017",
        category: "Groceries",
        stock: 50,
      },
      {
        id: "3",
        name: "Sugar 1kg",
        price: 42.0,
        barcode: "8901030895018",
        category: "Groceries",
        stock: 75,
      },
      {
        id: "4",
        name: "Tea 250g",
        price: 120.0,
        barcode: "8901030895019",
        category: "Beverages",
        stock: 30,
      },
      {
        id: "5",
        name: "Cooking Oil 1L",
        price: 150.0,
        barcode: "8901030895020",
        category: "Groceries",
        stock: 25,
      },
    ]

    let filteredProducts = mockProducts

    if (search) {
      filteredProducts = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.barcode.includes(search) ||
          product.category.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (barcode) {
      filteredProducts = mockProducts.filter((product) => product.barcode === barcode)
    }

    return NextResponse.json({ products: filteredProducts })
  } catch (error: any) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
