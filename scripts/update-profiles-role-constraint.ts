import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function updateProfilesRoleConstraint() {
  try {
    console.log("Updating profiles role constraint...")

    // SQL to update the role constraint
    const sql = `
      ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
      ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'retailer', 'wholesaler', 'delivery_partner'));
    `

    // Execute the SQL directly
    const { error } = await supabaseAdmin.rpc("exec_sql", { query: sql })

    if (error) {
      console.error("Error updating profiles role constraint:", error)
      return { success: false, error: error.message }
    }

    console.log("Successfully updated profiles role constraint")
    return { success: true, message: "Successfully updated profiles role constraint" }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

// Default export
export default updateProfilesRoleConstraint

// Run the function if this file is executed directly
if (require.main === module) {
  updateProfilesRoleConstraint()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}
