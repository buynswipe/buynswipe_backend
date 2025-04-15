import { NextResponse } from "next/server"
import { createDeliveryPartnersTableRPC } from "@/scripts/create-delivery-partners-table-rpc"

export async function POST() {
  try {
    const result = await createDeliveryPartnersTableRPC()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
