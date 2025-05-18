import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user profile to check role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
  }

  try {
    // Step 1: Check if notifications table exists
    console.log("Checking if notifications table exists...")
    const { error: tableCheckError } = await supabase.from("notifications").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes('relation "notifications" does not exist')) {
      console.log("Notifications table does not exist. Creating table...")

      // Create notifications table
      const { error: createTableError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            related_entity_type TEXT,
            related_entity_id TEXT,
            action_url TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT notifications_type_check CHECK (type IN ('success', 'info', 'warning', 'error'))
          );
          
          CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
          CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);
          CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
        `,
      })

      if (createTableError) {
        console.error("Error creating notifications table:", createTableError)
        return NextResponse.json(
          { error: `Failed to create notifications table: ${createTableError.message}` },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Notifications table created successfully with all required columns",
      })
    }

    // Step 2: Check if the table has the required columns
    console.log("Checking for required columns...")
    const { data: columns, error: columnsError } = await supabase.rpc("get_table_columns", {
      table_name: "notifications",
    })

    if (columnsError) {
      console.error("Error getting table columns:", columnsError)
      return NextResponse.json({ error: `Failed to get table columns: ${columnsError.message}` }, { status: 500 })
    }

    const columnNames = columns.map((col: any) => col.column_name)
    console.log("Existing columns:", columnNames)

    // Step 3: Check for entity_type vs related_entity_type
    const hasEntityType = columnNames.includes("entity_type")
    const hasEntityId = columnNames.includes("entity_id")
    const hasRelatedEntityType = columnNames.includes("related_entity_type")
    const hasRelatedEntityId = columnNames.includes("related_entity_id")

    // Case 1: Missing both sets of columns
    if (!hasEntityType && !hasRelatedEntityType) {
      console.log("Adding related_entity_type and related_entity_id columns...")

      const { error: addColumnsError } = await supabase.rpc("exec_sql", {
        sql_query: `
          ALTER TABLE public.notifications 
          ADD COLUMN related_entity_type TEXT,
          ADD COLUMN related_entity_id TEXT;
        `,
      })

      if (addColumnsError) {
        console.error("Error adding columns:", addColumnsError)
        return NextResponse.json({ error: `Failed to add entity columns: ${addColumnsError.message}` }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Added related_entity_type and related_entity_id columns to notifications table",
      })
    }
    // Case 2: Has entity_type but not related_entity_type
    else if ((hasEntityType || hasEntityId) && (!hasRelatedEntityType || !hasRelatedEntityId)) {
      console.log("Renaming entity columns to related_entity columns...")

      let sqlQuery = ""

      if (hasEntityType && !hasRelatedEntityType) {
        sqlQuery += `
          ALTER TABLE public.notifications 
          RENAME COLUMN entity_type TO related_entity_type;
        `
      }

      if (hasEntityId && !hasRelatedEntityId) {
        sqlQuery += `
          ALTER TABLE public.notifications 
          RENAME COLUMN entity_id TO related_entity_id;
        `
      }

      const { error: renameColumnsError } = await supabase.rpc("exec_sql", {
        sql_query: sqlQuery,
      })

      if (renameColumnsError) {
        console.error("Error renaming columns:", renameColumnsError)
        return NextResponse.json(
          { error: `Failed to rename entity columns: ${renameColumnsError.message}` },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Renamed entity columns to related_entity_type and related_entity_id",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Notifications table schema is already up to date with all required columns",
    })
  } catch (error: any) {
    console.error("Error fixing notifications schema:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
