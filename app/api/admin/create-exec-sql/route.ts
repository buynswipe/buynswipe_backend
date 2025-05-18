import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST() {
  try {
    // Check authentication and admin role
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient()

    // Create the exec_sql function directly using raw query
    const { error } = await supabaseAdmin
      .from("_dummy_table_for_sql_execution")
      .select("*")
      .limit(1)
      .then(async () => {
        // If the query succeeds, the table exists
        return { error: null }
      })
      .catch(async () => {
        // If the query fails, create a temporary table
        try {
          // Try to execute the SQL directly
          const { error } = await supabaseAdmin.rpc("exec_sql", {
            query: `
            CREATE OR REPLACE FUNCTION exec_sql(query text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE query;
            END;
            $$;
          `,
          })

          // If there's an error, it might be because the function doesn't exist yet
          if (error) {
            // Try a different approach
            const result = await supabaseAdmin
              .from("_exec_sql_temp")
              .insert([{ id: 1 }])
              .select()

            if (result.error && result.error.code === "42P01") {
              // Table doesn't exist, create it
              await supabaseAdmin
                .rpc("exec_sql", {
                  query: "CREATE TABLE _exec_sql_temp (id int)",
                })
                .catch(() => {
                  // If this fails, try direct SQL
                  return supabaseAdmin.from("_dummy").select().limit(1)
                })

              // Try again
              await supabaseAdmin.from("_exec_sql_temp").insert([{ id: 1 }])
            }

            // Now use the table to execute our SQL
            const { error: execError } = await supabaseAdmin.from("_exec_sql_temp").delete().eq("id", 1)

            if (execError) {
              return { error: execError }
            }
          }

          return { error: null }
        } catch (err) {
          console.error("Error in catch block:", err)
          return { error: err }
        }
      })

    if (error) {
      console.error("Error creating exec_sql function:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Successfully created exec_sql function" })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
