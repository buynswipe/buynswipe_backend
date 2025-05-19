import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // Check if the function already exists
    const { data: existingFunction, error: checkError } = await supabase.rpc("check_function_exists", {
      function_name: "exec_sql",
    })

    if (checkError) {
      // If the check function doesn't exist, we need to create it first
      const createCheckFunctionQuery = `
        CREATE OR REPLACE FUNCTION check_function_exists(function_name TEXT)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        AS $$
        DECLARE
          func_exists BOOLEAN;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = function_name
          ) INTO func_exists;
          
          RETURN func_exists;
        END;
        $$;
      `

      // Execute the query directly using the REST API
      const { error: createCheckError } = await supabase.from("_rpc").select("*").eq("name", "check_function_exists")

      if (createCheckError) {
        // Create the check function using direct SQL
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            query: createCheckFunctionQuery,
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: "Failed to create check_function_exists function" }, { status: 500 })
        }
      }
    }

    // If the function already exists, return success
    if (existingFunction && existingFunction === true) {
      return NextResponse.json({ message: "SQL execution function already exists" }, { status: 200 })
    }

    // Create the exec_sql function
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;

      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
      GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
    `

    // Execute the query directly using the REST API
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        query: createFunctionQuery,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to create SQL execution function" }, { status: 500 })
    }

    return NextResponse.json({ message: "SQL execution function created successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error creating SQL execution function:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
