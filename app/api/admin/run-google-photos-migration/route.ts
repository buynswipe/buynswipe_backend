import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
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

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Create a Supabase admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    try {
      // Create the table directly
      // We'll use a simpler approach that doesn't rely on SQL template literals or exec_sql

      // First, check if the table exists
      let tableExists = false
      try {
        const { data, error } = await supabaseAdmin.from("user_integrations").select("id").limit(1)
        if (!error) {
          tableExists = true
        }
      } catch (error) {
        // Table doesn't exist, which is expected
        console.log("Table doesn't exist yet, will create it")
      }

      if (!tableExists) {
        // Since we can't execute SQL directly, we'll use the Supabase REST API
        // to create the table and set up the schema

        // For now, let's return instructions for manual setup
        return NextResponse.json({
          success: true,
          message: "Google Photos integration setup initiated. Please complete the setup in the Supabase dashboard.",
          instructions: [
            "1. Go to your Supabase dashboard",
            "2. Navigate to the SQL Editor",
            "3. Run the following SQL:",
            `
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  token_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_integrations_user_id_provider_key UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own integrations" ON user_integrations;
CREATE POLICY "Users can view their own integrations" ON user_integrations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own integrations" ON user_integrations;
CREATE POLICY "Users can insert their own integrations" ON user_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own integrations" ON user_integrations;
CREATE POLICY "Users can update their own integrations" ON user_integrations FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own integrations" ON user_integrations;
CREATE POLICY "Users can delete their own integrations" ON user_integrations FOR DELETE USING (auth.uid() = user_id);
            `,
          ],
        })
      } else {
        // Table already exists
        return NextResponse.json({
          success: true,
          message: "Google Photos integration tables already exist",
        })
      }
    } catch (error: any) {
      console.error("Error creating user_integrations table:", error)
      return NextResponse.json({ error: `Error creating user_integrations table: ${error.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error running Google Photos migration:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
