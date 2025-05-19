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

    // Create the SQL function directly using the Supabase client
    const createFunctionQuery = `
      -- This function executes raw SQL queries with full admin privileges
      CREATE OR REPLACE FUNCTION exec_sql_direct(sql_query TEXT)
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
      GRANT EXECUTE ON FUNCTION exec_sql_direct(TEXT) TO authenticated;
      GRANT EXECUTE ON FUNCTION exec_sql_direct(TEXT) TO service_role;
    `

    // Execute the SQL query directly
    const { error } = await supabase
      .rpc("exec_sql_direct", {
        sql_query: createFunctionQuery,
      })
      .catch(async () => {
        // If the function doesn't exist yet, we need to create it directly
        // This is a bootstrap problem - we need to create the function to use it
        // So we'll use a direct query to create it

        // First try using the SQL API
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql_direct`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
            },
            body: JSON.stringify({ sql_query: createFunctionQuery }),
          })

          if (response.ok) {
            return { error: null }
          }

          // If that fails, try a direct query
          const { error } = await supabase
            .from("_direct_sql_execution")
            .select()
            .eq("query", createFunctionQuery)
            .limit(1)
          return { error }
        } catch (e) {
          return { error: e instanceof Error ? e : new Error("Failed to create function") }
        }
      })

    if (error) {
      console.error("Error creating SQL function:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
