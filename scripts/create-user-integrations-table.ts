import { createClient } from "@supabase/supabase-js"

async function createUserIntegrationsTable() {
  console.log("Creating user_integrations table...")

  try {
    // Load environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if the table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "user_integrations")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if table exists:", tableCheckError)
      return { success: false, error: tableCheckError }
    }

    // If the table already exists, we're done
    if (tableExists) {
      console.log("user_integrations table already exists")
      return { success: true }
    }

    // Create the table
    const { error: createTableError } = await supabase.sql`
      CREATE TABLE IF NOT EXISTS user_integrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        token_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT user_integrations_user_id_provider_key UNIQUE (user_id, provider)
      );
    `

    if (createTableError) {
      console.error("Error creating table:", createTableError)
      return { success: false, error: createTableError }
    }

    // Create indexes
    const { error: createIndexesError } = await supabase.sql`
      CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);
    `

    if (createIndexesError) {
      console.error("Error creating indexes:", createIndexesError)
      // Continue even if this fails
    }

    // Enable RLS
    const { error: enableRlsError } = await supabase.sql`
      ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
    `

    if (enableRlsError) {
      console.error("Error enabling RLS:", enableRlsError)
      // Continue even if this fails
    }

    // Create policies
    const policies = [
      `DROP POLICY IF EXISTS "Users can view their own integrations" ON user_integrations;
       CREATE POLICY "Users can view their own integrations" ON user_integrations FOR SELECT USING (auth.uid() = user_id);`,

      `DROP POLICY IF EXISTS "Users can insert their own integrations" ON user_integrations;
       CREATE POLICY "Users can insert their own integrations" ON user_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      `DROP POLICY IF EXISTS "Users can update their own integrations" ON user_integrations;
       CREATE POLICY "Users can update their own integrations" ON user_integrations FOR UPDATE USING (auth.uid() = user_id);`,

      `DROP POLICY IF EXISTS "Users can delete their own integrations" ON user_integrations;
       CREATE POLICY "Users can delete their own integrations" ON user_integrations FOR DELETE USING (auth.uid() = user_id);`,
    ]

    for (const policy of policies) {
      const { error: policyError } = await supabase.sql`${policy}`
      if (policyError) {
        console.warn("Policy error (continuing):", policyError)
      }
    }

    console.log("user_integrations table created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating user_integrations table:", error)
    return { success: false, error }
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createUserIntegrationsTable()
    .then((result) => {
      if (result.success) {
        console.log("Script completed successfully")
        process.exit(0)
      } else {
        console.error("Script failed:", result.error)
        process.exit(1)
      }
    })
    .catch((err) => {
      console.error("Unexpected error:", err)
      process.exit(1)
    })
}

export { createUserIntegrationsTable }
