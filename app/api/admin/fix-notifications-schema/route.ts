import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if the data column exists
    const { data: columnInfo, error: columnCheckError } = await supabase.rpc("exec_sql", {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'data'
      `,
    })

    if (columnCheckError) {
      return NextResponse.json({ error: "Error checking for data column" }, { status: 500 })
    }

    // If data column doesn't exist, add it
    if (!columnInfo || columnInfo.length === 0) {
      const { error: addColumnError } = await supabase.rpc("exec_sql", {
        sql_query: `
          ALTER TABLE notifications 
          ADD COLUMN IF NOT EXISTS data JSONB DEFAULT NULL;
        `,
      })

      if (addColumnError) {
        return NextResponse.json({ error: "Error adding data column" }, { status: 500 })
      }
    }

    // Add related_entity_type and related_entity_id columns if they don't exist
    const { error: addRelatedColumnsError } = await supabase.rpc("exec_sql", {
      sql_query: `
        ALTER TABLE notifications 
        ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS related_entity_id UUID DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS action_url TEXT DEFAULT NULL;
      `,
    })

    if (addRelatedColumnsError) {
      return NextResponse.json({ error: "Error adding related entity columns" }, { status: 500 })
    }

    // Fix any invalid UUIDs in the database
    const { error: fixUuidsError } = await supabase.rpc("exec_sql", {
      sql_query: `
        UPDATE notifications 
        SET related_entity_id = NULL 
        WHERE related_entity_id IS NOT NULL 
        AND related_entity_id::TEXT !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
      `,
    })

    if (fixUuidsError) {
      return NextResponse.json({ error: "Error fixing invalid UUIDs" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Notifications schema fixed successfully" })
  } catch (error: any) {
    console.error("Error fixing notifications schema:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
