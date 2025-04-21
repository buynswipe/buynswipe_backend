import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID is missing" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { name, phone, address, products } = body

    if (!name || !phone || !address || !products) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Create delivery in database

    return NextResponse.json({ message: "Delivery created" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
