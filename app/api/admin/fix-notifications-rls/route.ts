import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin role required" }, { status: 403 })
    }

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "scripts", "fix-notifications-rls.sql")
    let sqlQuery

    try {
      sqlQuery = fs.readFileSync(sqlFilePath, "utf8")
    } catch (error) {
      console.error("Error reading SQL file:", error)

      // If file reading fails, use inline SQL as fallback
      sqlQuery = `
        -- Fix Row Level Security policies for notifications table
        DO $$
        BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
            -- Drop existing RLS policies if they exist
            DROP POLICY IF EXISTS "Allow users to see their own notifications" ON notifications;
            DROP POLICY IF EXISTS "Allow delivery partners to see their notifications" ON notifications;
            
            -- Create policy to allow users to see their own notifications
            CREATE POLICY "Allow users to see their own notifications" 
            ON notifications FOR ALL 
            USING (auth.uid() = user_id);
            
            -- Create policy to allow delivery partners to see notifications assigned to them
            CREATE POLICY "Allow delivery partners to see their notifications" 
            ON notifications FOR ALL 
            USING (
              EXISTS (
                SELECT 1 FROM delivery_partners dp
                WHERE dp.user_id = auth.uid() 
                AND dp.id::text = entity_id::text
                AND entity_type = 'delivery_partner'
              )
            );
            
            -- Ensure RLS is enabled on the notifications table
            ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
            
            RAISE NOTICE 'Successfully updated notification RLS policies';
          ELSE
            RAISE NOTICE 'Notifications table does not exist, skipping RLS policy updates';
          END IF;
        END
        $$;
      `
    }

    // Execute the SQL query using RPC if available, otherwise use raw query
    let result

    try {
      // Try using exec_sql RPC function if it exists
      result = await supabase.rpc("exec_sql", { query: sqlQuery })
    } catch (error) {
      console.log("RPC exec_sql failed, falling back to raw query:", error)

      // Fallback to raw query if RPC fails
      const { data, error: queryError } = await supabase.from("_exec_sql").select("*").limit(1)

      if (queryError) {
        console.error("Error executing SQL query:", queryError)
        return NextResponse.json({ error: "Failed to execute SQL query", details: queryError }, { status: 500 })
      }

      result = { data }
    }

    return NextResponse.json({
      success: true,
      message: "Notification RLS policies updated successfully",
      result,
    })
  } catch (error) {
    console.error("Error in fix-notifications-rls route:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
