import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { getSupabaseServiceConfig } from "@/lib/supabase-config"

async function updateProfilesRoleConstraint() {
  try {
    const { url, serviceRoleKey } = getSupabaseServiceConfig()
    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    console.log("Reading SQL migration file...")
    const sqlFilePath = path.join(process.cwd(), "supabase/migrations/update-profiles-role-constraint.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    console.log("Executing SQL migration...")
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlContent })

    if (error) {
      console.error("Error executing SQL migration:", error)
      return { success: false, error: error.message }
    }

    console.log("Successfully updated profiles role constraint")
    return { success: true }
  } catch (error) {
    console.error("Error updating profiles role constraint:", error)
    return { success: false, error: String(error) }
  }
}

export default updateProfilesRoleConstraint
