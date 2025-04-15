import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a Supabase client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function createNotificationsTable() {
  try {
    console.log("Creating notifications table...")

    // Check if the table already exists
    const { error: checkError } = await supabaseAdmin.from("notifications").select("id").limit(1)

    if (!checkError) {
      console.log("Notifications table already exists")
      return { success: true, message: "Notifications table already exists" }
    }

    // Create the notifications table
    const { error } = await supabaseAdmin.sql`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        entity_type TEXT,
        entity_id TEXT,
        action_url TEXT
      );

      -- Create index for faster queries
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
    `

    if (error) {
      console.error("Error creating notifications table:", error)
      return { success: false, error: error.message }
    }

    console.log("Successfully created notifications table")
    return { success: true, message: "Successfully created notifications table" }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { success: false, error: error.message }
  }
}

// Default export
export default createNotificationsTable

// Run the function if this file is executed directly
if (require.main === module) {
  createNotificationsTable()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => process.exit())
}
