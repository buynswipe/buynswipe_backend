import { auth } from "@/auth"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

type OrderRouteProps = {
  params: {
    id: string
  }
}

export async function GET(req: Request, { params }: OrderRouteProps) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, params.id),
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
        profile: true,
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(orders.id, params.id),
    })

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 })
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }
    if (
      (profile.role === "retailer" && order.retailer_id !== session.user.id) ||
      (profile.role === "manufacturer" && order.manufacturer_id !== session.user.id)
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.log("[ORDER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
