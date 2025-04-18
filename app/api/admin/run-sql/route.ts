import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "Missing SQL query" }, { status: 400 })
    }

    // Execute the SQL
    const { error: queryError } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (queryError) {
      console.error("SQL execution error:", queryError)
      return NextResponse.json({ error: `SQL execution failed: ${queryError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "SQL executed successfully" })
  } catch (error: any) {
    console.error("Error in run-sql API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
