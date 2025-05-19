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

    // Create a direct Supabase client with admin privileges
    const adminClient = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
      auth: {
        persistSession: false,
      },
    })

    // Create the raw SQL execution function
    const createFunctionQuery = `
      -- This function executes raw SQL queries with full admin privileges
      CREATE OR REPLACE FUNCTION exec_raw_sql(sql_query TEXT)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE sql_query;
        result := '{"status": "success"}'::JSONB;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
          'status', 'error',
          'message', SQLERRM,
          'detail', SQLSTATE
        );
        RETURN result;
      END;
      $$;

      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_raw_sql(TEXT) TO authenticated;
      GRANT EXECUTE ON FUNCTION exec_raw_sql(TEXT) TO service_role;
    `

    // Try multiple methods to create the function
    let success = false
    let errorMessage = ""

    // Method 1: Try using the REST API directly
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        },
        body: JSON.stringify({
          sql_query: createFunctionQuery,
        }),
      })

      // If this succeeds, the function already exists
      if (response.ok) {
        success = true
      } else {
        // If it fails with a 404, the function doesn't exist yet
        const status = response.status
        if (status === 404) {
          // This is expected if the function doesn't exist yet
          console.log("Function doesn't exist yet, will create it")
        } else {
          // Other error
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          errorMessage = `REST API error: ${status} - ${JSON.stringify(errorData)}`
          console.error(errorMessage)
        }
      }
    } catch (error) {
      console.error("Error with REST API method:", error)
    }

    // Method 2: Try using pg-meta API if Method 1 failed
    if (!success) {
      try {
        const response = await fetch(`${process.env.SUPABASE_URL}/pg-meta/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
          },
          body: JSON.stringify({ query: createFunctionQuery }),
        })

        if (response.ok) {
          success = true
        } else {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          errorMessage = `pg-meta API error: ${response.status} - ${JSON.stringify(errorData)}`
          console.error(errorMessage)
        }
      } catch (error) {
        console.error("Error with pg-meta API method:", error)
      }
    }

    // Method 3: Try using the SQL API if Methods 1 and 2 failed
    if (!success) {
      try {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
            apikey: process.env.SUPABASE_ANON_KEY || "",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ query: createFunctionQuery }),
        })

        if (response.ok) {
          success = true
        } else {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          errorMessage = `SQL API error: ${response.status} - ${JSON.stringify(errorData)}`
          console.error(errorMessage)
        }
      } catch (error) {
        console.error("Error with SQL API method:", error)
      }
    }

    // Method 4: Last resort - try using the database directly
    if (!success) {
      try {
        // Create a temporary table to execute the SQL
        const { error } = await adminClient
          .from("_temp_exec_sql_creation")
          .select()
          .limit(1)
          .catch(async () => {
            // Table doesn't exist, create it
            const createTempTableQuery = `
            CREATE TEMPORARY TABLE IF NOT EXISTS _temp_exec_sql_creation (id SERIAL PRIMARY KEY);
            ${createFunctionQuery}
          `

            // Execute the query directly using the REST API
            const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
                apikey: process.env.SUPABASE_ANON_KEY || "",
                Prefer: "return=representation",
              },
              body: JSON.stringify({ query: createTempTableQuery }),
            })

            if (response.ok) {
              return { error: null }
            }

            return { error: new Error("Failed to create function using temporary table") }
          })

        if (!error) {
          success = true
        } else {
          errorMessage = `Direct database error: ${error.message}`
          console.error(errorMessage)
        }
      } catch (error) {
        console.error("Error with direct database method:", error)
      }
    }

    if (!success) {
      return NextResponse.json(
        {
          error: "Failed to create SQL function after trying multiple methods",
          details: errorMessage,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "SQL execution function created successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
