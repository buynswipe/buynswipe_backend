import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
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
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    // Create a direct Supabase client with admin privileges
    const adminClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
      auth: {
        persistSession: false,
      },
    })

    // Execute the SQL query directly
    const { data, error } = await adminClient
      .rpc("exec_raw_sql", {
        sql_query: query,
      })
      .catch(async (err) => {
        console.error("Error executing SQL with RPC:", err)

        // Fallback: Try direct SQL execution if RPC fails
        try {
          // This is a direct SQL query using the REST API
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              sql_query: query,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
            return { data: null, error: errorData }
          }

          const result = await response.json()
          return { data: result, error: null }
        } catch (fetchError) {
          console.error("Error with direct fetch:", fetchError)
          return { data: null, error: fetchError }
        }
      })

    if (error) {
      console.error("Error executing SQL query:", error)
      return NextResponse.json({ error: error.message || "Failed to execute SQL query" }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: data }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
