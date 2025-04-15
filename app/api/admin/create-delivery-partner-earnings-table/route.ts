import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    // Read SQL file
    const sqlFilePath = path.join(process.cwd(), "scripts", "create-delivery-partner-earnings-table.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlQuery })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ error: `Failed to create table: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Delivery partner earnings table created successfully" })
  } catch (error: any) {
    console.error("Error creating delivery partner earnings table:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create delivery partner earnings table" },
      { status: 500 },
    )
  }
}
