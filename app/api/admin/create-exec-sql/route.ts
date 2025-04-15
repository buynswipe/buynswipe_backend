import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()

    // SQL to create the exec_sql function
    const sql = `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
    `

    // Execute the SQL directly
    const { error } = await supabase.rpc("exec_sql", { query: sql })

    // If there's an error, it might be because the function doesn't exist yet
    if (error) {
      // Try to create it directly
      const { error: directError } = await supabase
        .from("_exec_sql_temp")
        .select("*")
        .limit(1)
        .then(() => {
          return { error: null }
        })
        .catch(async () => {
          // Create a temporary table to execute the SQL
          await supabase.from("_exec_sql_temp").insert([{ id: 1 }])

          // Use PostgreSQL's DO block to execute anonymous code
          const { error: doBlockError } = await supabase
            .from("_exec_sql_temp")
            .delete()
            .eq("id", 1)
            .select(`
          DO $$
          BEGIN
            ${sql}
          END;
          $$;
        `)

          return { error: doBlockError }
        })

      if (directError) {
        return NextResponse.json(
          { error: `Failed to create exec_sql function: ${directError.message}` },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating exec_sql function:", error)
    return NextResponse.json({ error: "Failed to create exec_sql function" }, { status: 500 })
  }
}
