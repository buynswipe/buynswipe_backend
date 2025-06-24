import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { barcode: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const barcode = params.barcode

    if (!barcode) {
      return NextResponse.json({ error: "Barcode is required" }, { status: 400 })
    }

    // Mock product database with barcodes
    const mockProducts = [
      {
        id: "prod_1",
        name: "Coca Cola 500ml",
        price: 25.0,
        barcode: "1234567890123",
        category: "Beverages",
        stock: 50,
        costPrice: 18.0,
        marginPercentage: 38.9,
        supplier: "Coca Cola India",
        image: "/placeholder.svg?height=100&width=100",
        description: "Refreshing cola drink",
        isActive: true,
        tags: ["bestseller", "cold-drink"],
      },
      {
        id: "prod_2",
        name: "Lays Classic 50g",
        price: 20.0,
        barcode: "9876543210987",
        category: "Snacks",
        stock: 75,
        costPrice: 14.0,
        marginPercentage: 42.9,
        supplier: "PepsiCo India",
        image: "/placeholder.svg?height=100&width=100",
        description: "Crispy potato chips",
        isActive: true,
        tags: ["snack", "popular"],
      },
      {
        id: "prod_3",
        name: "Maggi 2-Minute Noodles",
        price: 12.0,
        barcode: "5555555555555",
        category: "Groceries",
        stock: 100,
        costPrice: 8.5,
        marginPercentage: 41.2,
        supplier: "Nestle India",
        image: "/placeholder.svg?height=100&width=100",
        description: "Instant noodles",
        isActive: true,
        tags: ["instant", "popular"],
      },
      {
        id: "prod_4",
        name: "Colgate Total 100g",
        price: 85.0,
        barcode: "1111111111111",
        category: "Personal Care",
        stock: 25,
        costPrice: 65.0,
        marginPercentage: 30.8,
        supplier: "Colgate Palmolive",
        image: "/placeholder.svg?height=100&width=100",
        description: "Advanced toothpaste",
        isActive: true,
        tags: ["healthcare", "dental"],
      },
      {
        id: "prod_5",
        name: "Surf Excel 1kg",
        price: 180.0,
        barcode: "7777777777777",
        category: "Household",
        stock: 15,
        costPrice: 140.0,
        marginPercentage: 28.6,
        supplier: "Hindustan Unilever",
        image: "/placeholder.svg?height=100&width=100",
        description: "Laundry detergent powder",
        isActive: true,
        tags: ["cleaning", "household"],
      },
    ]

    // Find product by barcode
    const product = mockProducts.find((p) => p.barcode === barcode)

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
          barcode,
          suggestions: [
            "Check if the barcode is correct",
            "Ensure the product is in your inventory",
            "Contact support to add this product",
          ],
        },
        { status: 404 },
      )
    }

    // Log the barcode scan for analytics
    console.log(`Barcode scanned: ${barcode} - Product: ${product.name}`)

    return NextResponse.json({
      ...product,
      scannedAt: new Date().toISOString(),
      scanMethod: "barcode",
    })
  } catch (error: any) {
    console.error("Barcode lookup error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Add product to barcode database
export async function POST(request: NextRequest, { params }: { params: { barcode: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const barcode = params.barcode
    const productData = await request.json()

    // In a real implementation, you would:
    // 1. Validate the product data
    // 2. Check if barcode already exists
    // 3. Save to database
    // 4. Generate barcode image if needed

    const newProduct = {
      id: `prod_${Date.now()}`,
      barcode,
      ...productData,
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    console.log("Product added with barcode:", newProduct)

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: "Product successfully linked to barcode",
    })
  } catch (error: any) {
    console.error("Barcode assignment error:", error)
    return NextResponse.json(
      {
        error: "Failed to assign barcode",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
