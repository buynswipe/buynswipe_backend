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

    // Create the get_table_columns function using executeSQL
    const sql = `
      CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
      RETURNS TABLE(column_name text, data_type text, is_nullable boolean)
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          c.column_name::text,
          c.data_type::text,
          (c.is_nullable = 'YES') AS is_nullable
        FROM 
          information_schema.columns c
        WHERE 
          c.table_schema = 'public'
          AND c.table_name = get_table_columns.table_name;
      END;
      $$;
      
      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO service_role;
    `

    const result = await executeSQL(sql)

    if (!result.success) {
      console.error("Error creating get_table_columns function:", result.error)
      return NextResponse.json({
        success: false,
        error: result.error?.message || "Failed to create function",
      })
    }

    return NextResponse.json({
      success: true,
      message: "get_table_columns function created successfully",
    })
  } catch (error: any) {
    console.error("Error in create-get-table-columns-function route:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Internal server error",
    })
  }
}
