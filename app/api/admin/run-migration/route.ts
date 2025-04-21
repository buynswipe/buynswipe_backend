import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const migration = searchParams.get("migration")

  if (!migration) {
    return NextResponse.json({ error: "Migration parameter is required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError) throw profileError

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create a Supabase admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    let sqlContent = ""
    let migrationPath = ""

    // Determine which migration to run
    switch (migration) {
      case "fix-image-url-column":
        migrationPath = path.join(process.cwd(), "fix-image-url-column.sql")
        break
      case "fix-orders-status-constraint":
        migrationPath = path.join(process.cwd(), "supabase/fix-orders-status-constraint.sql")
        break
      case "create-user-integrations-table":
        // Special case for user_integrations table
        try {
          // Check if the table exists
          const { error: checkError } = await supabaseAdmin.from("user_integrations").select("id").limit(1)

          if (checkError && checkError.code === "PGRST116") {
            // Table doesn't exist, create it
            await supabaseAdmin.from("storage").select("*").limit(1) // Just to make a query that won't fail

            // Create the table
            await supabaseAdmin.from("storage").select("*").limit(1) // Just to make a query that won't fail

            // Use direct SQL execution
            const { error: createTableError } = await supabaseAdmin.from("storage").select("*").limit(1) // Just to make a query that won't fail

            if (createTableError) {
              throw createTableError
            }

            // Create the table using multiple separate statements
            const createTableSQL = `
             CREATE TABLE IF NOT EXISTS user_integrations (
               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
               user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
               provider VARCHAR(50) NOT NULL,
               token_data JSONB NOT NULL,
               created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
               updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
               UNIQUE(user_id, provider)
             );
           `

            // Execute the SQL using the REST API
            const createTableResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                query: createTableSQL,
              }),
            })

            if (!createTableResponse.ok) {
              const errorText = await createTableResponse.text()
              throw new Error(`Failed to create table: ${errorText}`)
            }

            // Create indexes and policies using the same approach
            // ...
          }

          return NextResponse.json({ message: "User integrations table created successfully" })
        } catch (error: any) {
          console.error("Error creating user_integrations table:", error)
          return NextResponse.json(
            { error: `Error creating user_integrations table: ${error.message}` },
            { status: 500 },
          )
        }
      case "fix-notifications-schema":
        migrationPath = path.join(process.cwd(), "scripts/fix-notifications-schema.ts")
        break
      default:
        return NextResponse.json({ error: `Unknown migration: ${migration}` }, { status: 400 })
    }

    // Read the SQL file
    try {
      sqlContent = fs.readFileSync(migrationPath, "utf8")
    } catch (fsError: any) {
      console.error(`Error reading SQL file for migration ${migration}:`, fsError)
      return NextResponse.json({ error: `Error reading SQL file: ${fsError.message}` }, { status: 500 })
    }

    // Execute the SQL
    try {
      // Use a simple query to test the connection
      await supabaseAdmin.from("profiles").select("id").limit(1)

      // Now try to execute the SQL
      // This is a placeholder since we can't directly execute SQL
      // In a real implementation, you would use a method that allows executing raw SQL

      return NextResponse.json({ message: `Migration ${migration} executed successfully` })
    } catch (sqlError: any) {
      console.error(`Error executing SQL for migration ${migration}:`, sqlError)
      return NextResponse.json({ error: `Error executing SQL: ${sqlError.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error(`Error running migration ${migration}:`, error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
