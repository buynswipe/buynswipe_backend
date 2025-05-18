import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { executeSQL } from "@/lib/database-helpers"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Get SQL from request body
    const body = await request.json()
    const { sql } = body

    if (!sql) {
      return NextResponse.json({ error: "SQL is required" }, { status: 400 })
    }

    // Execute SQL
    const result = await executeSQL(sql)

    if (!result.success) {
      console.error("Error executing SQL:", result.error)
      return NextResponse.json({
        success: false,
        error: result.error?.message || "Failed to execute SQL",
      })
    }

    return NextResponse.json({
      success: true,
      message: "SQL executed successfully",
    })
  } catch (error: any) {
    console.error("Error in execute-sql route:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
    })
  }
}
