import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

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

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Get the SQL query from the request body
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "No SQL query provided" }, { status: 400 })
    }

    // Execute the SQL query directly using the Supabase client
    const { data, error } = await supabase
      .rpc("exec_sql_direct", {
        sql_query: query,
      })
      .catch(() => {
        // If RPC fails, try direct query
        return supabase.from("_exec_sql").select().eq("query", query).limit(1)
      })

    if (error) {
      console.error("Error executing SQL query:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, message: "SQL executed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error executing SQL:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
