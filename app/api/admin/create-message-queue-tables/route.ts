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

    // Check if the message queue tables already exist
    try {
      // Try to query the message_queue table to see if it exists
      const { data: queueData, error: queueError } = await supabase.from("message_queue").select("id").limit(1)
      const { data: processedData, error: processedError } = await supabase
        .from("processed_messages")
        .select("id")
        .limit(1)

      // If no errors, both tables exist
      if (!queueError && !processedError) {
        return NextResponse.json({ message: "Message queue tables already exist" }, { status: 200 })
      }

      // If errors are not about the tables not existing, return the error
      if (
        (queueError && !queueError.message.includes("relation")) ||
        (processedError && !processedError.message.includes("relation"))
      ) {
        throw new Error(queueError?.message || processedError?.message)
      }
    } catch (error) {
      // If error is not about the tables not existing, it's an unexpected error
      if (error instanceof Error && !error.message.includes("relation")) {
        console.error("Error checking if message queue tables exist:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      // Otherwise, continue with creating the tables
    }

    // Create the message queue tables
    const createTablesQuery = `
      -- Create message queue table
      CREATE TABLE IF NOT EXISTS message_queue (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        message_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 3,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create processed messages table for deduplication
      CREATE TABLE IF NOT EXISTS processed_messages (
        id UUID PRIMARY KEY,
        message_type TEXT NOT NULL,
        processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Add indexes for faster lookups
      CREATE INDEX IF NOT EXISTS message_queue_status_idx ON message_queue(status);
      CREATE INDEX IF NOT EXISTS message_queue_next_attempt_idx ON message_queue(next_attempt_at);
      CREATE INDEX IF NOT EXISTS message_queue_priority_idx ON message_queue(priority);
      CREATE INDEX IF NOT EXISTS processed_messages_type_idx ON processed_messages(message_type);
    `

    // Execute the SQL query directly using the new function name
    const { error } = await supabase.rpc("exec_sql_direct", {
      sql_query: createTablesQuery,
    })

    if (error) {
      console.error("Error creating message queue tables:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Message queue tables created successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error creating message queue tables:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
