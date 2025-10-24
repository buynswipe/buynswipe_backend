import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function updateProfilesRoleConstraint() {
  try {
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
