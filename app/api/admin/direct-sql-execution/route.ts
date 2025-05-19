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
      return NextResponse.json({ error: "No SQL query provided" }, { status: 400 })
    }

    // Create a direct Supabase client with admin privileges
    const adminClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
      auth: {
        persistSession: false,
      },
    })

    // Execute the SQL query directly using the REST API
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        apikey: process.env.SUPABASE_ANON_KEY || "",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      let errorMessage = `SQL execution failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = `${errorMessage}: ${JSON.stringify(errorData)}`
      } catch (e) {
        // If we can't parse the error response, just use the status code
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "SQL executed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error executing SQL:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
