import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

interface Params {
  params: { id: string }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const orderId = params.id
    const { status } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is missing" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "Status is missing" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        profile: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
    }
    if (
      (profile.role === "retailer" && order.retailer_id !== session.user.id) ||
      (profile.role === "manufacturer" && order.manufacturer_id !== session.user.id)
    ) {
      return NextResponse.json({ error: "Unauthorized to update this order" }, { status: 403 })
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("[ORDER_PATCH]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
