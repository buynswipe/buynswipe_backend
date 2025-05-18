import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a Supabase client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function createExecSqlFunction() {
  try {
    console.log("Creating exec_sql function...")

    // Create the exec_sql function directly using SQL
    const { error } = await supabaseAdmin
      .rpc("exec_sql", {
        query: `
        -- Create a function to execute SQL statements
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
      .catch(async () => {
        // If exec_sql doesn't exist yet, we need to create it directly
        const { error } = await supabaseAdmin.sql`
        -- Create a function to execute SQL statements
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
        return { error }
      })

    if (error) {
      console.error("Error creating exec_sql function:", error)
      return { success: false, error: error.message }
    }

    console.log("Successfully created exec_sql function")
    return { success: true, message: "Successfully created exec_sql function" }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

// Default export
export default createExecSqlFunction

// Run the function if this file is executed directly
if (require.main === module) {
  createExecSqlFunction()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}
