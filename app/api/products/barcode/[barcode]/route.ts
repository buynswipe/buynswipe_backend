import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { barcode: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { barcode } = params

    // Check authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .eq("status", "active")
      .single()

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
