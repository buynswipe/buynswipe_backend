import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { openingCash } = await request.json()

    // Create a simple session object for now
    const posSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      openingCash: openingCash || 0,
      totalSales: 0,
      totalTransactions: 0,
      userId: session.user.id,
    }

    return NextResponse.json(posSession)
  } catch (error: any) {
    console.error("POS session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return mock session data for now
    const posSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      openingCash: 1000,
      totalSales: 0,
      totalTransactions: 0,
      userId: session.user.id,
    }

    return NextResponse.json(posSession)
  } catch (error: any) {
    console.error("POS session fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
