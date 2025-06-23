import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

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
    const query = url.searchParams.get("q")
    const barcode = url.searchParams.get("barcode")

    if (!query && !barcode) {
      return NextResponse.json({ error: "Search query or barcode required" }, { status: 400 })
    }

    let searchQuery = supabase
      .from("products")
      .select(`
        *,
        product_barcodes(*)
      `)
      .gt("stock_quantity", 0)

    if (barcode) {
      // Search by barcode
      searchQuery = searchQuery.or(`barcode.eq.${barcode},product_barcodes.barcode.eq.${barcode}`)
    } else if (query) {
      // Search by name, SKU, or description
      searchQuery = searchQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
    }

    const { data: products, error } = await searchQuery.limit(20)

    if (error) {
      return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
    }

    return NextResponse.json({ success: true, products })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
