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

    // Create the SQL function using the SQL API
    const createFunctionQuery = `
      -- This function executes raw SQL queries with full admin privileges
      CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'SQL Error: %', SQLERRM;
      END;
      $$;

      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
      GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
    `

    // Use the Supabase SQL API to execute the query
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        apikey: process.env.SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({ query: createFunctionQuery }),
    })

    if (!response.ok) {
      let errorMessage = `Failed to create SQL function with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = `${errorMessage}: ${JSON.stringify(errorData)}`
      } catch (e) {
        // If we can't parse the error response, just use the status code
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "SQL execution function created successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unexpected error creating SQL function:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
