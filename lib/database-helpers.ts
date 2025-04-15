import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function executeSQL(sql: string) {
  try {
    const { error } = await supabaseAdmin.rpc("exec_sql", { query: sql })
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Error executing SQL:", error)
    return { success: false, error }
  }
}

export async function checkTableExists(tableName: string) {
  try {
    const { data, error } = await supabaseAdmin.from(tableName).select("*").limit(1)
    if (error && error.code === "PGRST116") {
      return false
    }
    return true
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}
