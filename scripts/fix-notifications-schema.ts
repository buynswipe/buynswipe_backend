import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: {
    persistSession: false,
  },
})

async function fixNotificationsSchema() {
  console.log("Starting notifications schema fix...")

  try {
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
      console.error("Error checking for data column:", columnCheckError)
      return
    }

    // If data column doesn't exist, add it
    if (!columnInfo || columnInfo.length === 0) {
      console.log("Data column not found, adding it to notifications table...")

      const { error: addColumnError } = await supabase.rpc("exec_sql", {
        sql_query: `
          ALTER TABLE notifications 
          ADD COLUMN IF NOT EXISTS data JSONB DEFAULT NULL;
        `,
      })

      if (addColumnError) {
        console.error("Error adding data column:", addColumnError)
        return
      }

      console.log("Data column added successfully")
    } else {
      console.log("Data column already exists")
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
      console.error("Error adding related entity columns:", addRelatedColumnsError)
      return
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
      console.error("Error fixing invalid UUIDs:", fixUuidsError)
      return
    }

    console.log("Notifications schema fixed successfully")
  } catch (error) {
    console.error("Error fixing notifications schema:", error)
  }
}

// Run the function
fixNotificationsSchema()
