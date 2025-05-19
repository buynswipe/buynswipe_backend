import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Check if the notifications table already exists
    try {
      // Try to query the notifications table to see if it exists
      const { data, error } = await supabase.from("notifications").select("id").limit(1)

      // If no error, the table exists
      if (!error) {
        return NextResponse.json({ message: "Notifications table already exists" }, { status: 200 })
      }

      // If error is not about the table not existing, return the error
      if (!error.message.includes("relation") || !error.message.includes("does not exist")) {
        throw new Error(error.message)
      }
    } catch (error) {
      // If error is not about the table not existing, it's an unexpected error
      if (
        error instanceof Error &&
        (!error.message.includes("relation") || !error.message.includes("does not exist"))
      ) {
        console.error("Error checking if notifications table exists:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      // Otherwise, continue with creating the table
    }

    // Create the notifications table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        related_entity_type TEXT,
        related_entity_id UUID,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add index for faster lookups
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
      CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
    `

    // Execute the SQL query directly using the new function name
    const { error } = await supabase.rpc("exec_sql_direct", {
      sql_query: createTableQuery,
    })

    if (error) {
      console.error("Error creating notifications table:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Notifications table created successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error creating notifications table:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
