import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Read SQL file
    const sqlFilePath = path.join(process.cwd(), "supabase/migrations/update-profiles-role-constraint.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    // Execute SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlContent })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully updated profiles constraint" }, { status: 200 })
  } catch (error) {
    console.error("Error updating profiles constraint:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
