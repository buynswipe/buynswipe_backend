import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
      *,
      retailer:profiles!retailer_id(business_name, address, city, pincode),
      wholesaler:wholesaler_id(business_name, address, city, pincode)
    `)
      .eq("status", "delivered")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching completed deliveries:", error)
      return NextResponse.json({ error: "Failed to fetch completed deliveries" }, { status: 500 })
    }

    return NextResponse.json({ deliveries: data })
  } catch (error) {
    console.error("Error in GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
