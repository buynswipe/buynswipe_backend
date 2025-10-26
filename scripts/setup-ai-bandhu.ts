import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAIBandhuSchema() {
  try {
    console.log("Starting AI Bandhu schema setup...")

    // Read the migration file
    const migrationPath = path.join(__dirname, "../supabase/migrations/ai_bandhu_schema.sql")
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8")

    // Execute the migration
    const { error } = await supabase.rpc("exec", {
      sql: migrationSQL,
    })

    if (error) {
      console.error("Error executing migration:", error)
      process.exit(1)
    }

    console.log("AI Bandhu schema setup completed successfully!")

    // Verify tables were created
    const tables = [
      "ai_bandhu_conversations",
      "ai_bandhu_messages",
      "ai_bandhu_voice_logs",
      "ai_bandhu_insights",
      "ai_bandhu_user_preferences",
    ]

    for (const table of tables) {
      const { data, error: checkError } = await supabase.from(table).select("count", { count: "exact", head: true })

      if (checkError) {
        console.error(`Error verifying table ${table}:`, checkError)
      } else {
        console.log(`✓ Table ${table} created successfully`)
      }
    }
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}

setupAIBandhuSchema()
