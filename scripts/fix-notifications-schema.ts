import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
})

async function fixNotificationsSchema() {
  console.log("Checking notifications table schema...")

  try {
    // Check if notifications table exists
    const { error: tableCheckError } = await supabase.from("notifications").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes('relation "notifications" does not exist')) {
      console.log("Notifications table does not exist. Creating table...")

      // Create notifications table
      const { error: createTableError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.notifications (
            id UUID PRIMARY KEY,
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
        throw new Error(`Failed to create notifications table: ${createTableError.message}`)
      }

      console.log("Notifications table created successfully")
      return
    }

    // Check if the table has the required columns
    console.log("Checking for required columns...")
    const { data: columns, error: columnsError } = await supabase.rpc("get_table_columns", {
      table_name: "notifications",
    })

    if (columnsError) {
      throw new Error(`Failed to get table columns: ${columnsError.message}`)
    }

    const columnNames = columns.map((col: any) => col.column_name)
    console.log("Existing columns:", columnNames)

    // Check for entity_type vs related_entity_type
    const hasEntityType = columnNames.includes("entity_type")
    const hasRelatedEntityType = columnNames.includes("related_entity_type")

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
        throw new Error(`Failed to add entity columns: ${addColumnsError.message}`)
      }

      console.log("Added related_entity_type and related_entity_id columns")
    } else if (hasEntityType && !hasRelatedEntityType) {
      console.log("Renaming entity_type and entity_id columns to related_entity_type and related_entity_id...")

      const { error: renameColumnsError } = await supabase.rpc("exec_sql", {
        sql_query: `
          ALTER TABLE public.notifications 
          RENAME COLUMN entity_type TO related_entity_type;
          
          ALTER TABLE public.notifications 
          RENAME COLUMN entity_id TO related_entity_id;
        `,
      })

      if (renameColumnsError) {
        throw new Error(`Failed to rename entity columns: ${renameColumnsError.message}`)
      }

      console.log("Renamed entity columns to related_entity_type and related_entity_id")
    }

    console.log("Notifications table schema is now up to date")
  } catch (error) {
    console.error("Error fixing notifications schema:", error)
    throw error
  }
}

// Run the function
fixNotificationsSchema()
  .then(() => {
    console.log("Schema fix completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Schema fix failed:", error)
    process.exit(1)
  })
