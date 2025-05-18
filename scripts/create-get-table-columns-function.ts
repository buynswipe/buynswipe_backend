import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function createGetTableColumnsFunction() {
  try {
    console.log("Creating get_table_columns function...")

    const { error } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: `
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
      `,
    })

    if (error) {
      console.error("Error creating get_table_columns function:", error)
      throw error
    }

    console.log("get_table_columns function created successfully")
    return { success: true }
  } catch (error) {
    console.error("Failed to create get_table_columns function:", error)
    return { success: false, error }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  createGetTableColumnsFunction()
    .then((result) => {
      console.log("Result:", result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Unhandled error:", error)
      process.exit(1)
    })
}

export { createGetTableColumnsFunction }
